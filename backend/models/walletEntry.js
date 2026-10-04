const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true, unique: true },
  type: { type: String, enum: ['topup', 'refund', 'purchase'], required: true },
  provider: { type: String, enum: ['stripe', 'paypal', 'wallet'], required: true },
  amountCents: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'succeeded'], default: 'pending' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  providerId: String,
  providerPaymentId: String,
  url: String,
  lastCheckedAt: Date,
  emailSent: { type: Boolean, default: false },
  emailClaimUntil: Date,
}, { timestamps: true });
schema.index({ provider: 1, providerId: 1 }, { unique: true, partialFilterExpression: { providerId: { $type: 'string' } } });
module.exports = mongoose.model('WalletEntry', schema);
