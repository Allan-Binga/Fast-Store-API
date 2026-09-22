const Order = require("../models/orders");
const { settleOrder, releaseAbandoned } = require("./orders");
const getStripe = require("./stripe");

// Recover lost webhook deliveries and release abandoned checkout reservations.
async function reconcileOrders() {
  if (!process.env.STRIPE_SECRET_KEY) return;
  const stripe = getStripe();
  const orders = await Order.find({ paymentStatus: "pending", stockReserved: true, expiresAt: { $lt: new Date(Date.now() - 300000) } }).sort({ expiresAt: 1 }).limit(50);
  for (const order of orders) {
    try {
    let remote;
    if (order.stripeSessionId) remote = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    else {
      // A successful Stripe response may have been lost before its ID was saved.
      for await (const candidate of stripe.checkout.sessions.list({ created: { gte: Math.floor(order.createdAt.getTime() / 1000) - 60, lte: Math.floor(order.expiresAt.getTime() / 1000) + 300 }, limit: 100 })) {
        if (candidate.metadata?.orderId === String(order._id)) { remote = candidate; break; }
      }
      if (remote) await Order.updateOne({ _id: order._id }, { $set: { stripeSessionId: remote.id, stripeSessionUrl: remote.url } });
    }
    if (remote) await settleOrder(remote);
    else await releaseAbandoned(order._id);
    } catch (err) { console.error("Order reconciliation deferred:", String(order._id), err.message); }
  }
  // Retry confirmation mail independently from payment and inventory state.
  const awaitingMail = await Order.find({ paymentStatus: "paid", confirmationSent: false }).sort({ createdAt: 1 }).limit(50);
  for (const order of awaitingMail) {
    try { await require("./confirmation").confirmOrder(order._id); }
    catch { console.error("Order confirmation delivery deferred."); }
  }
}
module.exports = { reconcileOrders };
