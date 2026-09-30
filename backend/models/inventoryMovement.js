const mongoose = require("mongoose");


const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    type: {
      type: String,
      enum: [
        "initial_stock",
        "reservation",
        "reservation_release",
        "restock",
        "manual_adjustment",
        "refund_restock",
      ],
      required: true,
      index: true,
    },
    quantityChange: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "Inventory movement must use whole units.",
      },
    },
    quantityBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema
);
