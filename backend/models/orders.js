const mongoose = require("mongoose");

// Keep authoritative purchase snapshots and reconciliation identifiers together.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkoutKey: { type: String },
  requestHash: String,
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, required: true }, name: String, image: String, price: Number, quantity: Number, saleId: mongoose.Schema.Types.ObjectId }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "usd", required: true },
  paymentStatus: { type: String, required: true, default: "pending" },
  stripeSessionId: String,
  stripeSessionUrl: String,
  expiresAt: Date,
  stockReserved: { type: Boolean, default: false },
  confirmationClaimUntil: Date,
  confirmationSent: { type: Boolean, default: false },
  cartItems: [{ itemId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });
schema.index({ user: 1, checkoutKey: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: "string" } } });
module.exports = mongoose.model("Order", schema);
