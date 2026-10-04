const Refund = require('../models/refund');
const User = require('../models/users');
const { sendMail, template, money } = require('./email');
async function reconcileRefundEmails() {
  const filter = { status: { $in: ['requested', 'succeeded', 'rejected', 'failed'] }, $expr: { $ne: ['$status', { $ifNull: ['$emailStatus', ''] }] } };
  const awaiting = await Refund.find(filter).sort({ updatedAt: 1 }).limit(50);
  for (const candidate of awaiting) {
    const refund = await Refund.findOneAndUpdate({ ...filter, _id: candidate._id, $or: [{ emailClaimUntil: { $exists: false } }, { emailClaimUntil: { $lt: new Date() } }] }, { $set: { emailClaimUntil: new Date(Date.now() + 300000) } }, { new: true });
    if (!refund) continue;
    try {
      const user = await User.findById(refund.user);
      if (!user) throw Error('Refund recipient missing');
      const amount = money(refund.amount, refund.currency);
      const description = {
        requested: `We received your refund request for ${amount}. It is awaiting administrator review.`,
        succeeded: `Your refund of ${amount} has been ${refund.destination === 'wallet' ? 'credited to your FastStore wallet' : 'processed to your original payment method. Your bank may need additional time to post it'}.`,
        rejected: `Your refund request for ${amount} was declined. ${refund.rejectionReason || 'Please contact customer care for details.'}`,
        failed: `Your refund of ${amount} could not be completed. Please contact customer care.`,
      }[refund.status];
      await sendMail(user.email, `FastStore refund · ${refund.status}`, template('An update on your refund', description, '', { label: 'View refund details', path: '/refunds' }));
      await Refund.updateOne({ _id: refund._id }, { $set: { emailStatus: refund.status }, $unset: { emailClaimUntil: 1 } });
    } catch {
      await Refund.updateOne({ _id: refund._id }, { $unset: { emailClaimUntil: 1 } });
      console.error('Refund email delivery deferred.');
    }
  }
}
module.exports = { reconcileRefundEmails };
