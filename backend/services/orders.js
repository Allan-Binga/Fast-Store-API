const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/product");
const FlashSale = require("../models/flashsale");
const Cart = require("../models/cart");
const PaymentTransaction = require("../models/paymentTransaction");
const InventoryMovement = require("../models/inventoryMovement");
const { fail } = require("../utils/http");

async function transaction(callback) {
  try {
    return await mongoose.connection.transaction(callback);
  } catch (error) {
    if (error.code === 20 && /transaction/i.test(error.message)) {
      throw fail(503, "Checkout requires MongoDB configured as a replica set.");
    }
    throw error;
  }
}

async function reserveOrder(data, suppliedSession) {
  let order;
  const reserve = async (session) => {
    const existing = await Order.findOne({
      user: data.user,
      checkoutKey: data.checkoutKey,
    }).session(session);
    if (existing) {
      order = existing;
      return;
    }

    const inventoryMovements = [];

    for (const item of data.items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: {
            quantity: -item.quantity,
          },
        },
        {
          new: false,
          session,
        },
      ).select("+costPrice");

      if (!product) {
        throw fail(409, "An item is no longer in stock.");
      }

      item.costPrice = product.costPrice || 0;

      inventoryMovements.push({
        product: item.productId,
        type: "reservation",
        quantityChange: -item.quantity,
        quantityBefore: product.quantity,
        quantityAfter: product.quantity - item.quantity,
        reason: "Checkout stock reservation",
      });

      if (item.saleId) {
        const now = new Date();
        const sale = await FlashSale.updateOne(
          {
            _id: item.saleId,
            startTime: { $lte: now },
            endTime: { $gt: now },
            quantityAvailable: { $gte: item.quantity },
          },
          { $inc: { quantityAvailable: -item.quantity } },
          { session },
        );
        if (sale.modifiedCount !== 1) throw fail(409, "A sale is no longer available.");
      }
    }

    [order] = await Order.create(
      [
        {
          ...data,
          stockReserved: true,
        },
      ],
      {
        session,
      },
    );

    if (inventoryMovements.length) {
      await InventoryMovement.create(
        inventoryMovements.map((movement) => ({
          ...movement,
          order: order._id,
        })),
        {
          session,
        },
      );
    }
  };
  if (suppliedSession) await reserve(suppliedSession);
  else await transaction(reserve);
  return order;
}

async function clearPurchasedCartItems(order, session) {
  if (!order.cartItems?.length) return;
  await Cart.updateOne(
    { userId: order.user },
    {
      $pull: {
        products: {
          $or: order.cartItems.map((item) => ({
            _id: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
    },
    { session },
  );
}

async function restoreStock(order, session) {
  for (const item of order.items) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
      },
      {
        $inc: {
          quantity: item.quantity,
        },
      },
      {
        new: false,
        session,
      },
    );

    if (product) {
      await InventoryMovement.create(
        [
          {
            product: item.productId,
            order: order._id,
            type: "reservation_release",
            quantityChange: item.quantity,
            quantityBefore: product.quantity,
            quantityAfter: product.quantity + item.quantity,
            reason: "Expired payment reservation released",
          },
        ],
        {
          session,
        },
      );
    }

    if (item.saleId) {
      await FlashSale.updateOne(
        { _id: item.saleId },
        { $inc: { quantityAvailable: item.quantity } },
        { session },
      );
    }
  }
}

async function recordPaymentTransaction(
  order,
  session,
  transactionData,
) {
  if (!transactionData) {
    return;
  }

  await PaymentTransaction.updateOne(
    {
      provider: transactionData.provider,
      type: "payment",
      providerTransactionId:
        transactionData.providerTransactionId,
    },
    {
      $setOnInsert: {
        order: order._id,
        user: order.user,
        provider: transactionData.provider,
        type: "payment",
        providerTransactionId:
          transactionData.providerTransactionId,
        amount: order.totalAmount,
        currency: order.currency,
        status: "succeeded",
        occurredAt: order.paidAt || new Date(),
        metadata: transactionData.metadata,
      },
    },
    {
      upsert: true,
      session,
    },
  );
}

async function markPaid(
  order,
  session,
  updates = {},
  transactionData,
) {
  if (order.paymentStatus === "paid") {
    await recordPaymentTransaction(
      order,
      session,
      transactionData,
    );
    return;
  }

  if (!order.stockReserved) {
    throw fail(
      409,
      "Order reservation has already been released."
    );
  }

  Object.assign(order, updates);
  order.paymentStatus = "paid";
  order.paidAt = order.paidAt || new Date();
  order.fulfillmentStatus = "requested";
  await require("../models/delivery").updateOne(
    { order: order._id },
    { $setOnInsert: { order: order._id, user: order.user, status: "requested" } },
    { upsert: true, session },
  );
  order.stockReserved = false;

  await clearPurchasedCartItems(order, session);
  await order.save({ session });
  await recordPaymentTransaction(
    order,
    session,
    transactionData,
  );
}

async function markExpired(order, session) {
  if (!order.stockReserved || order.paymentStatus !== "pending") return;
  await restoreStock(order, session);
  order.stockReserved = false;
  order.paymentStatus = "expired";
  await order.save({ session });
}

async function settleOrder(stripeSession) {
  let settled;
  await transaction(async (session) => {
    const order = await Order.findOne({
      _id: stripeSession.metadata?.orderId,
      stripeSessionId: stripeSession.id,
    }).session(session);
    if (!order) throw fail(503, "Order is not yet ready for reconciliation.");

    const matches =
      String(order.user) === stripeSession.metadata?.user &&
      stripeSession.currency === order.currency &&
      stripeSession.amount_total === Math.round(order.totalAmount * 100);
    if (!matches) throw fail(409, "Payment does not match the order.");

    if (["paid", "no_payment_required"].includes(stripeSession.payment_status)) {
      const paymentIntentId =
        typeof stripeSession.payment_intent === "string"
          ? stripeSession.payment_intent
          : stripeSession.payment_intent?.id;

      await markPaid(
        order,
        session,
        {
          stripePaymentIntentId:
            paymentIntentId || order.stripePaymentIntentId,
        },
        {
          provider: "stripe",
          providerTransactionId:
            paymentIntentId || stripeSession.id,
          metadata: {
            checkoutSessionId: stripeSession.id,
          },
        },
      );
    } else if (stripeSession.status === "expired") {
      await markExpired(order, session);
    }
    settled = order;
  });
  return settled;
}

function paypalCapture(paypalOrder) {
  return paypalOrder.purchaseUnits
    ?.flatMap((unit) => unit.payments?.captures || [])
    .find((capture) => capture.status === "COMPLETED");
}

async function settlePayPalOrder(paypalOrder) {
  let settled;
  await transaction(async (session) => {
    const order = await Order.findOne({
      paymentProvider: "paypal",
      paypalOrderId: paypalOrder.id,
    }).session(session);
    if (!order) throw fail(503, "Order is not yet ready for reconciliation.");

    const capture = paypalCapture(paypalOrder);
    if (paypalOrder.status !== "COMPLETED" || !capture) {
      throw fail(409, "PayPal has not completed this payment.");
    }
    const amount = capture.amount;
    const matches =
      amount?.currencyCode?.toLowerCase() === order.currency &&
      Math.round(Number(amount?.value) * 100) === Math.round(order.totalAmount * 100);
    if (!matches) throw fail(409, "Payment does not match the order.");

    await markPaid(
      order,
      session,
      {
        paypalCaptureId: capture.id,
      },
      {
        provider: "paypal",
        providerTransactionId: capture.id,
        metadata: {
          paypalOrderId: paypalOrder.id,
        },
      },
    );
    settled = order;
  });
  return settled;
}

async function expirePayPalOrder(paypalOrderId) {
  await transaction(async (session) => {
    const order = await Order.findOne({
      paymentProvider: "paypal",
      paypalOrderId,
    }).session(session);
    if (order) await markExpired(order, session);
  });
}

async function settleMpesaOrder(payment) {
  let settled;
  await transaction(async (session) => {
    const order = await Order.findOne({
      paymentProvider: "mpesa",
      mpesaCheckoutRequestId: payment.checkoutRequestId,
    }).session(session);
    if (!order) throw fail(503, "Order is not yet ready for reconciliation.");

    const matches =
      order.currency === "kes" &&
      Number(payment.amount) === Math.round(order.totalAmount);
    if (!matches) throw fail(409, "Payment does not match the order.");

    await markPaid(order, session, {
      mpesaMerchantRequestId: payment.merchantRequestId || order.mpesaMerchantRequestId,
      mpesaReceiptNumber: payment.receiptNumber,
    });
    settled = order;
  });
  return settled;
}

async function expireMpesaOrder(checkoutRequestId) {
  await transaction(async (session) => {
    const order = await Order.findOne({
      paymentProvider: "mpesa",
      mpesaCheckoutRequestId: checkoutRequestId,
    }).session(session);
    if (order) await markExpired(order, session);
  });
}

async function releaseAbandoned(orderId) {
  await transaction(async (session) => {
    const order = await Order.findOne({
      _id: orderId,
      stockReserved: true,
      paymentStatus: "pending",
      stripeSessionId: { $exists: false },
      paypalOrderId: { $exists: false },
      mpesaCheckoutRequestId: { $exists: false },
      expiresAt: { $lt: new Date(Date.now() - 300000) },
    }).session(session);
    if (order) await markExpired(order, session);
  });
}

module.exports = {
  markPaid,
  reserveOrder,
  settleOrder,
  settlePayPalOrder,
  expirePayPalOrder,
  settleMpesaOrder,
  expireMpesaOrder,
  releaseAbandoned,
};
