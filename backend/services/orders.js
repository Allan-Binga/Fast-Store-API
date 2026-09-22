const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/product");
const FlashSale = require("../models/flashsale");
const Cart = require("../models/cart");
const { fail } = require("../utils/http");

// Give standalone deployments an actionable error rather than a generic failure.
async function transaction(callback) {
  try { return await mongoose.connection.transaction(callback); }
  catch (err) {
    if (err.code === 20 && /transaction/i.test(err.message)) throw fail(503, "Checkout requires MongoDB configured as a replica set.");
    throw err;
  }
}

// Transactions prevent partial reservations and require a MongoDB replica set.
async function reserveOrder(data) {
  let order;
  await transaction(async session => {
    const existing = await Order.findOne({ user: data.user, checkoutKey: data.checkoutKey }).session(session);
    if (existing) { order = existing; return; }
    for (const item of data.items) {
      const result = await Product.updateOne({ _id: item.productId, quantity: { $gte: item.quantity } }, { $inc: { quantity: -item.quantity } }, { session });
      if (result.modifiedCount !== 1) throw fail(409, "An item is no longer in stock.");
      if (item.saleId) {
        const now = new Date();
        const sale = await FlashSale.updateOne({ _id: item.saleId, startTime: { $lte: now }, endTime: { $gt: now }, quantityAvailable: { $gte: item.quantity } }, { $inc: { quantityAvailable: -item.quantity } }, { session });
        if (sale.modifiedCount !== 1) throw fail(409, "A sale is no longer available.");
      }
    }
    [order] = await Order.create([{ ...data, stockReserved: true }], { session });
  });
  return order;
}

// Repeated Stripe deliveries cannot release stock or clear purchased items twice.
async function settleOrder(stripeSession) {
  let settled;
  await transaction(async session => {
    const order = await Order.findOne({ _id: stripeSession.metadata?.orderId, stripeSessionId: stripeSession.id }).session(session);
    if (!order) throw fail(503, "Order is not yet ready for reconciliation.");
    if (String(order.user) !== stripeSession.metadata?.user || stripeSession.currency !== order.currency || stripeSession.amount_total !== Math.round(order.totalAmount * 100)) throw fail(409, "Payment does not match the order.");
    if (stripeSession.payment_status === "paid" || stripeSession.payment_status === "no_payment_required") {
      if (order.paymentStatus !== "paid") {
        if (!order.stockReserved) throw fail(409, "Order reservation has already been released.");
        order.paymentStatus = "paid";
        order.stockReserved = false;
        // Preserve unrelated products added after checkout began.
        if (order.cartItems?.length) await Cart.updateOne({ userId: order.user }, { $pull: { products: { $or: order.cartItems.map(item => ({ _id: item.itemId, quantity: item.quantity })) } } }, { session });
        await order.save({ session });
      }
    } else if (stripeSession.status === "expired" && order.stockReserved) {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.productId }, { $inc: { quantity: item.quantity } }, { session });
        if (item.saleId) await FlashSale.updateOne({ _id: item.saleId }, { $inc: { quantityAvailable: item.quantity } }, { session });
      }
      order.stockReserved = false;
      order.paymentStatus = "expired";
      await order.save({ session });
    }
    settled = order;
  });
  return settled;
}
// Release abandoned reservations only after Stripe reconciliation confirms no session exists.
async function releaseAbandoned(orderId) {
  await transaction(async session => {
    const order = await Order.findOne({ _id: orderId, stockReserved: true, paymentStatus: "pending", stripeSessionId: { $exists: false }, expiresAt: { $lt: new Date(Date.now() - 300000) } }).session(session);
    if (!order) return;
    for (const item of order.items) {
      await Product.updateOne({ _id: item.productId }, { $inc: { quantity: item.quantity } }, { session });
      if (item.saleId) await FlashSale.updateOne({ _id: item.saleId }, { $inc: { quantityAvailable: item.quantity } }, { session });
    }
    order.stockReserved = false;
    order.paymentStatus = "expired";
    await order.save({ session });
  });
}
module.exports = { reserveOrder, settleOrder, releaseAbandoned };
