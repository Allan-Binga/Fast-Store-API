const Order = require('../models/orders');
const Delivery = require('../models/delivery');
const User = require('../models/users');
const { sendMail, template, escapeHtml, money } = require('./email');
const pendingQuery = { paymentStatus: { $in: ['paid', 'partially_refunded'] }, fulfillmentStatus: { $in: ['unfulfilled', 'requested'] }, adminDeliveryEmailSent: { $ne: true } };
async function notifyPendingDelivery(orderId) {
  if (!process.env.ADMIN_CLIENT_URL) throw Error('Administrator URL is not configured.');
  const order = await Order.findOneAndUpdate({ ...pendingQuery, _id: orderId, $or: [{ adminDeliveryEmailClaimUntil: { $exists: false } }, { adminDeliveryEmailClaimUntil: { $lt: new Date() } }] }, { $set: { adminDeliveryEmailClaimUntil: new Date(Date.now() + 300000) } }, { new: true });
  if (!order) return;
  try {
    const admins = await User.find({ role: 'Admin', isVerified: true }).select('email').limit(100).lean();
    if (!admins.length) throw Error('No verified administrator recipients.');
    const body = `<p><strong>Order ${escapeHtml(order._id)}</strong><br>${money(order.totalAmount, order.currency)} · ${order.items.reduce((n, item) => n + item.quantity, 0)} items</p>`;
    for (const admin of admins) await sendMail(admin.email, 'Paid order ready for delivery · ' + order._id, template('A paid order needs delivery', 'Payment is confirmed. Review the order and initiate its delivery from the pending queue.', body, { label: 'Review pending delivery', path: `/deliveries/pending?orderId=${order._id}`, baseUrl: process.env.ADMIN_CLIENT_URL }));
    await Order.updateOne({ _id: order._id }, { $set: { adminDeliveryEmailSent: true }, $unset: { adminDeliveryEmailClaimUntil: 1 } });
  } catch (error) {
    await Order.updateOne({ _id: order._id }, { $unset: { adminDeliveryEmailClaimUntil: 1 } });
    throw error;
  }
}
async function notifyDeliveryStarted(id) {
  const delivery = await Delivery.findOneAndUpdate({ _id: id, status: { $in: ['initiated', 'delivered'] }, customerEmailSent: { $ne: true }, $or: [{ customerEmailClaimUntil: { $exists: false } }, { customerEmailClaimUntil: { $lt: new Date() } }] }, { $set: { customerEmailClaimUntil: new Date(Date.now() + 300000) } }, { new: true });
  if (!delivery) return;
  try {
    const user = await User.findById(delivery.user);
    if (!user) throw Error('Delivery recipient missing');
    await sendMail(user.email, 'Your FastStore delivery has started', template('Your order is on its way', 'The store has initiated delivery for your order. Track its progress in your account.', `<p>Order <strong>${escapeHtml(delivery.order)}</strong></p>${delivery.estimatedDeliveryAt ? `<p>Estimated arrival: ${escapeHtml(new Date(delivery.estimatedDeliveryAt).toISOString())}</p>` : ''}${delivery.note ? `<p>${escapeHtml(delivery.note)}</p>` : ''}`, { label: 'Track your delivery', path: `/deliveries?orderId=${delivery.order}` }));
    await Delivery.updateOne({ _id: id }, { $set: { customerEmailSent: true }, $unset: { customerEmailClaimUntil: 1 } });
  } catch (error) {
    await Delivery.updateOne({ _id: id }, { $unset: { customerEmailClaimUntil: 1 } });
    throw error;
  }
}
async function reconcileDeliveryNotifications() {
  const orders = await Order.find(pendingQuery).sort({ paidAt: 1 }).limit(50);
  for (const order of orders) {
    try { await notifyPendingDelivery(order._id); } catch { console.error('Administrator delivery email deferred.'); }
  }
  const deliveries = await Delivery.find({ status: { $in: ['initiated', 'delivered'] }, customerEmailSent: { $ne: true } }).sort({ initiatedAt: 1 }).limit(50);
  for (const delivery of deliveries) {
    try { await notifyDeliveryStarted(delivery._id); } catch { console.error('Customer delivery email deferred.'); }
  }
}
module.exports = { notifyPendingDelivery, notifyDeliveryStarted, reconcileDeliveryNotifications };
