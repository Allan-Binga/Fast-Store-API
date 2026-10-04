const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currency: { type: String, default: 'usd', required: true },
  balanceCents: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
}, { timestamps: true });
schema.index({ user: 1, currency: 1 }, { unique: true });
module.exports = mongoose.model('Wallet', schema);
