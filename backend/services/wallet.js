const mongoose = require('mongoose');
const Wallet = require('../models/wallet');
const Entry = require('../models/walletEntry');
const { fail } = require('../utils/http');
const getStripe = require('./stripe');
const getPayPal = require('./paypal');

async function creditEntry(entry, session) {
  const updated = await Entry.findOneAndUpdate({ _id: entry._id, status: 'pending' }, { $set: { status: 'succeeded', providerPaymentId: entry.providerPaymentId } }, { new: true, session });
  if (!updated) return;
  await Wallet.updateOne({ user: entry.user, currency: entry.currency }, { $inc: { balanceCents: entry.amountCents } }, { upsert: true, session, setDefaultsOnInsert: false });
}
async function settleStripe(remote) {
  const entry = await Entry.findOne({ provider: 'stripe', providerId: remote.id });
  if (!entry) return false;
  if (remote.payment_status !== 'paid') return true;
  if (remote.metadata?.walletEntryId !== String(entry._id) || remote.metadata?.user !== String(entry.user) || remote.currency !== entry.currency || remote.amount_total !== entry.amountCents) throw fail(409, 'Wallet payment does not match.');
  entry.providerPaymentId = typeof remote.payment_intent === 'string' ? remote.payment_intent : remote.payment_intent?.id;
  await mongoose.connection.transaction(session => creditEntry(entry, session));
  return true;
}
async function settlePayPal(remote) {
  const entry = await Entry.findOne({ provider: 'paypal', providerId: remote.id });
  if (!entry) return false;
  const unit = remote.purchaseUnits?.[0];
  const captures = unit?.payments?.captures || [];
  const capture = captures.find(c => c.status === 'COMPLETED');
  if (remote.status !== 'COMPLETED' || !capture) return true;
  if (unit.customId !== String(entry._id) || captures.length !== 1 || capture.amount?.currencyCode?.toLowerCase() !== entry.currency || Math.round(Number(capture.amount?.value) * 100) !== entry.amountCents) throw fail(409, 'Wallet payment does not match.');
  entry.providerPaymentId = capture.id;
  await mongoose.connection.transaction(session => creditEntry(entry, session));
  return true;
}
async function reconcileWallet() {
  const pending = await Entry.find({ status: 'pending', type: 'topup', providerId: { $exists: true } }).sort({ lastCheckedAt: 1 }).limit(50);
  for (const entry of pending) {
    try {
      if (entry.provider === 'stripe') await settleStripe(await getStripe().checkout.sessions.retrieve(entry.providerId));
      else await settlePayPal((await getPayPal().orders.getOrder({ id: entry.providerId })).result);
    } catch { console.error('Wallet payment reconciliation deferred.'); }
    finally { await Entry.updateOne({ _id: entry._id }, { $set: { lastCheckedAt: new Date() } }); }
  }
  const awaiting = await Entry.find({ status: 'succeeded', emailSent: false }).limit(50);
  for (const candidate of awaiting) {
    const entry = await Entry.findOneAndUpdate({ _id: candidate._id, emailSent: false, $or: [{ emailClaimUntil: { $exists: false } }, { emailClaimUntil: { $lt: new Date() } }] }, { $set: { emailClaimUntil: new Date(Date.now() + 300000) } }, { new: true });
    if (!entry) continue;
    try {
      const user = await require('../models/users').findById(entry.user);
      if (!user) throw Error('User missing');
      const { sendMail, template, money } = require('./email');
      await sendMail(user.email, 'Funds added to your FastStore wallet', template('Your wallet has been credited', `${entry.type === 'refund' ? 'Your approved refund' : 'Your payment'} added ${money(entry.amountCents / 100, entry.currency)} to your wallet.`, '', { label: 'View wallet', path: '/wallet' }));
      await Entry.updateOne({ _id: entry._id }, { $set: { emailSent: true }, $unset: { emailClaimUntil: 1 } });
    } catch {
      await Entry.updateOne({ _id: entry._id }, { $unset: { emailClaimUntil: 1 } });
      console.error('Wallet email delivery deferred.');
    }
  }
}
module.exports = { creditEntry, settleStripe, settlePayPal, reconcileWallet };
