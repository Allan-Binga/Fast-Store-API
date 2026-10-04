const mongoose = require("mongoose");


const paymentTransactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paypal", "wallet"],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["payment", "refund", "fee", "dispute", "payout"],
      required: true,
      index: true,
    },
    providerTransactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    feeAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    netAmount: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "cancelled"],
      required: true,
      index: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);


paymentTransactionSchema.index(
  {
    provider: 1,
    type: 1,
    providerTransactionId: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema
);
