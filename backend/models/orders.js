const mongoose = require("mongoose");

// Keep authoritative purchase snapshots and reconciliation identifiers together.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkoutKey: { type: String },
  requestHash: String,
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, required: true }, name: String, image: String, price: Number, costPrice: { type: Number, min: 0, select: false }, quantity: Number, saleId: mongoose.Schema.Types.ObjectId }],
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "usd", required: true },
  paymentStatus: { type: String, required: true, default: "pending" },
  paymentProvider: { type: String, enum: ["stripe", "paypal", "mpesa"], default: "stripe" },
  stripeSessionId: String,
  stripeSessionUrl: String,
  stripePaymentIntentId: String,
  paypalOrderId: String,
  paypalCaptureId: String,
  mpesaCheckoutRequestId: String,
  mpesaMerchantRequestId: String,
  mpesaReceiptNumber: String,
  expiresAt: Date,
  stockReserved: { type: Boolean, default: false },
  paidAt: Date,
  refundedAmount: { type: Number, default: 0, min: 0 },
  refundPendingAmount: { type: Number, default: 0, min: 0 },
  fulfillmentStatus: {
    type: String,
    enum: ["unfulfilled", "initiated", "delivered"],
    default: "unfulfilled",
  },
  confirmationClaimUntil: Date,
  confirmationSent: { type: Boolean, default: false },
  cartItems: [{ itemId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });
schema.index({ user: 1, checkoutKey: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: "string" } } });
schema.index({ paypalOrderId: 1 }, { unique: true, sparse: true });
schema.index({ mpesaCheckoutRequestId: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model("Order", schema);
