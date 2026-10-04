const Order = require("../models/orders");
const User = require("../models/users");
const { sendOrderConfirmationEmail } = require("../controllers/emailService");

// A short database lease prevents concurrent webhook deliveries from duplicating mail.
// Delivery remains at-least-once if a process dies after delivery but before recording it.
async function confirmOrder(orderId) {
  try { await require("./deliveryNotifications").notifyPendingDelivery(orderId); } catch { console.error("Administrator delivery notice deferred."); }
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: { $in: ["paid", "partially_refunded", "refunded"] },
      confirmationSent: false,
      $or: [
        { confirmationClaimUntil: { $exists: false } },
        { confirmationClaimUntil: { $lt: new Date() } },
      ],
    },
    { $set: { confirmationClaimUntil: new Date(Date.now() + 300000) } },
    { new: true },
  );
  if (!order) return;
  try {
    const user = await User.findById(order.user);
    if (!user) throw new Error("Receipt recipient not found.");
    await sendOrderConfirmationEmail(user.email, order);
    await Order.updateOne(
      { _id: order._id },
      {
        $set: { confirmationSent: true },
        $unset: { confirmationClaimUntil: 1 },
      },
    );
  } catch (err) {
    await Order.updateOne(
      { _id: order._id },
      { $unset: { confirmationClaimUntil: 1 } },
    );
    throw err;
  }
}
module.exports = { confirmOrder };
