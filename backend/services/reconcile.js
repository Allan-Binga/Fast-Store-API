const Order = require("../models/orders");
const {
  settleOrder,
  settlePayPalOrder,
  expirePayPalOrder,
  expireMpesaOrder,
  releaseAbandoned,
} = require("./orders");
const getPayPal = require("./paypal");
const getStripe = require("./stripe");

// Recover lost webhook deliveries and release abandoned checkout reservations.
async function reconcileOrders() {
  try { await require("./wallet").reconcileWallet(); } catch { console.error("Wallet reconciliation deferred."); }
  try { await require("./refundEmails").reconcileRefundEmails(); } catch { console.error("Refund email reconciliation deferred."); }
  try { await require("./deliveryNotifications").reconcileDeliveryNotifications(); } catch { console.error("Delivery notification reconciliation deferred."); }
  const stripe = process.env.STRIPE_SECRET_KEY ? getStripe() : null;
  const orders = await Order.find({
    paymentStatus: "pending",
    stockReserved: true,
    expiresAt: { $lt: new Date(Date.now() - 300000) },
  })
    .sort({ expiresAt: 1 })
    .limit(50);
  for (const order of orders) {
    try {
      if (order.paymentProvider === "paypal" && order.paypalOrderId) {
        const remote = (await getPayPal().orders.getOrder({ id: order.paypalOrderId })).result;
        if (remote.status === "COMPLETED") await settlePayPalOrder(remote);
        else await expirePayPalOrder(order.paypalOrderId);
        continue;
      }
      if (order.paymentProvider === "mpesa") {
        if (order.mpesaCheckoutRequestId) await expireMpesaOrder(order.mpesaCheckoutRequestId);
        else await releaseAbandoned(order._id);
        continue;
      }
      if (!stripe) {
        if (!order.stripeSessionId && !order.paypalOrderId && !order.mpesaCheckoutRequestId) {
          await releaseAbandoned(order._id);
        }
        continue;
      }

      let remote;
      if (order.stripeSessionId)
        remote = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      else {
        // A successful Stripe response may have been lost before its ID was saved.
        for await (const candidate of stripe.checkout.sessions.list({
          created: {
            gte: Math.floor(order.createdAt.getTime() / 1000) - 60,
            lte: Math.floor(order.expiresAt.getTime() / 1000) + 300,
          },
          limit: 100,
        })) {
          if (candidate.metadata?.orderId === String(order._id)) {
            remote = candidate;
            break;
          }
        }
        if (remote)
          await Order.updateOne(
            { _id: order._id },
            {
              $set: {
                stripeSessionId: remote.id,
                stripeSessionUrl: remote.url,
              },
            },
          );
      }
      if (remote) await settleOrder(remote);
      else await releaseAbandoned(order._id);
    } catch (err) {
      console.error(
        "Order reconciliation deferred:",
        String(order._id),
        err.message,
      );
    }
  }
  // Retry confirmation mail independently from payment and inventory state.
  const awaitingMail = await Order.find({
    paymentStatus: { $in: ["paid", "partially_refunded", "refunded"] },
    confirmationSent: false,
  })
    .sort({ createdAt: 1 })
    .limit(50);
  for (const order of awaitingMail) {
    try {
      await require("./confirmation").confirmOrder(order._id);
    } catch {
      console.error("Order confirmation delivery deferred.");
    }
  }
}
module.exports = { reconcileOrders };
