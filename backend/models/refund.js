const mongoose = require("mongoose");


const refundSchema = new mongoose.Schema(
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
    emailStatus: String,
    emailClaimUntil: Date,
    destination: { type: String, enum: ["original", "wallet"], default: "original" },
    provider: {
      type: String,
      enum: ["stripe", "paypal", "wallet"],
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      required: true,
    },
    providerRefundId: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      enum: [
        "customer_request",
        "cancelled_before_shipping",
        "damaged_product",
        "wrong_product",
        "non_delivery",
        "duplicate_payment",
        "unable_to_fulfill",
        "fraudulent",
        "other",
      ],
      required: true,
    },
    customerExplanation: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    evidenceImages: {
      type: [String],
      default: [],
      validate: {
        validator: (images) =>
          images.length <= 2 &&
          images.every(
            (image) =>
              typeof image === "string" &&
              image.trim()
          ),
        message: "Refund evidence accepts at most two valid image URLs.",
      },
    },
    status: {
      type: String,
      enum: [
        "requested",
        "processing",
        "succeeded",
        "failed",
        "rejected",
      ],
      default: "requested",
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedByRole: {
      type: String,
      enum: ["Customer", "Admin"],
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    processedAt: {
      type: Date,
    },
    restockDecision: {
      type: String,
      enum: ["none", "pending", "restocked"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "Refund",
  refundSchema
);
