const mongoose = require("mongoose");

const PromoSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["deal", "mega-deal"],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // startTime: Date,
    // endTime: Date,
    priority: {
      type: Number,
      default: 0, // To control order in frontend
    },
  },
  { timestamps: true }
);

const Promo = mongoose.model("Promo", PromoSchema);
module.exports = Promo;
