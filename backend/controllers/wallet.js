const Entry = require('../models/walletEntry');
const Wallet = require('../models/wallet');
const { asyncHandler, fail, requireId, pagination } = require('../utils/http');
const getStripe = require('../services/stripe');
const getPayPal = require('../services/paypal');
const { settleStripe, settlePayPal } = require('../services/wallet');
function amountCents(value) {
  if (!['number', 'string'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value))) throw fail(400, 'Enter an amount with up to two decimal places.');
  const cents = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(cents) || cents < 100 || cents > 100000) throw fail(400, 'Add between $1 and $1,000.');
  return cents;
}
const getWallet = asyncHandler(async (req, res) => {
  const balances = await Wallet.find({ user: req.userId }).lean();
  const entries = await Entry.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ balances, entries });
});
const createTopup = asyncHandler(async (req, res) => {
  const cents = amountCents(req.body.amount);
  const provider = req.body.provider;
  if (!['stripe', 'paypal'].includes(provider)) throw fail(400, 'Choose Stripe or PayPal.');
  const key = req.get('Idempotency-Key');
  if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) throw fail(400, 'Provide an Idempotency-Key.');
  if (!process.env.CLIENT_URL) throw fail(503, 'Storefront URL is not configured.');
  const entryKey = `topup:${req.userId}:${key}`;
  let entry;
  try { entry = await Entry.findOneAndUpdate({ key: entryKey }, { $setOnInsert: { user: req.userId, key: entryKey, amountCents: cents, provider, type: 'topup', currency: 'usd' } }, { upsert: true, new: true }); }
  catch (error) { if (error.code !== 11000) throw error; entry = await Entry.findOne({ key: entryKey }); }
  if (entry.amountCents !== cents || entry.provider !== provider) throw fail(409, 'This payment key belongs to a different top-up.');
  if (entry.status === 'succeeded' || entry.providerId) return res.json(entry);
  if (provider === 'stripe') {
    const remote = await getStripe().checkout.sessions.create({ mode: 'payment', payment_method_types: ['card'], line_items: [{ price_data: { currency: 'usd', unit_amount: cents, product_data: { name: 'FastStore wallet top-up' } }, quantity: 1 }], metadata: { walletEntryId: String(entry._id), user: req.userId }, success_url: `${process.env.CLIENT_URL.replace(/\/$/, '')}/wallet?topup=${entry._id}`, cancel_url: `${process.env.CLIENT_URL.replace(/\/$/, '')}/wallet?cancelled=1` }, { idempotencyKey: `wallet-${entry._id}` });
    entry.providerId = remote.id; entry.url = remote.url;
  } else {
    const remote = (await getPayPal().orders.createOrder({ body: { intent: 'CAPTURE', purchaseUnits: [{ customId: String(entry._id), amount: { currencyCode: 'USD', value: (cents / 100).toFixed(2) } }] }, paypalRequestId: `wallet-${entry._id}`, prefer: 'return=representation' })).result;
    entry.providerId = remote.id;
  }
  await entry.save();
  res.status(201).json(entry);
});
const confirmTopup = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({ _id: requireId(req.params.id), user: req.userId, type: 'topup' });
  if (!entry || !entry.providerId) throw fail(404, 'Wallet payment not found.');
  if (entry.status !== 'succeeded') {
    if (entry.provider === 'stripe') await settleStripe(await getStripe().checkout.sessions.retrieve(entry.providerId));
    else {
      let remote = (await getPayPal().orders.getOrder({ id: entry.providerId })).result;
      if (remote.status === 'APPROVED') remote = (await getPayPal().orders.captureOrder({ id: entry.providerId, paypalRequestId: `wallet-capture-${entry._id}`, prefer: 'return=representation' })).result;
      await settlePayPal(remote);
    }
  }
  res.json(await Entry.findById(entry._id));
});
const listAdminWallets = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);
  const query = {};
  if (req.query.userId !== undefined) query.user = requireId(req.query.userId);
  const [wallets, total] = await Promise.all([
    Wallet.find(query).populate("user", "firstName lastName email").sort({ updatedAt: -1, _id: 1 }).skip(skip).limit(limit).lean(),
    Wallet.countDocuments(query),
  ]);
  res.json({ wallets, total });
});
const getAdminUserWallet = asyncHandler(async (req, res) => {
  const userId = requireId(req.params.userId);
  const user = await require("../models/users").findOne({ _id: userId, role: "Customer" }).select("firstName lastName email").lean();
  if (!user) throw fail(404, "Customer not found.");
  const { limit, skip } = pagination(req);
  const [balances, entries, total] = await Promise.all([
    Wallet.find({ user: userId }).lean(),
    Entry.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Entry.countDocuments({ user: userId }),
  ]);
  res.json({ user, balances, entries, total });
});
module.exports = { listAdminWallets, getAdminUserWallet, getWallet, createTopup, confirmTopup, amountCents };
