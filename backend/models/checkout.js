const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema(
  {
    // STRIPE DETAILS
    stripeSessionId: {
      type: String, // Stripe Checkout Session ID
      required: true,
      unique: true,
    },
    paymentIntentId: {
      type: String, // Stripe Payment Intent ID
    },
    amount: {
      type: Number, // Total amount paid in the smallest currency unit
      required: true,
    },
    currency: {
      type: String, // Currency code
      default: "usd",
    },
    paymentStatus: {
      type: String, // Stripe status (e.g., 'succeeded', 'canceled')
      enum: ["succeeded", "processing", "requires_payment_method", "canceled"],
      default: "processing",
    },

    // Optional: Links to your app's user if needed
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

const Checkout = mongoose.model("Checkout", CheckoutSchema);
module.exports = Checkout;
