const mongoose = require("mongoose");


const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["initiated", "delivered"],
      default: "initiated",
      required: true,
      index: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    estimatedDeliveryAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    confirmedByCustomerAt: {
      type: Date,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "Delivery",
  deliverySchema
);
