const mongoose = require("mongoose");

//WISHLIST SCHEMA
const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        name: { type: String, required: true },
        currentPrice: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0 },
        category: { type: [String], required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        reviews: {
          rate: { type: Number, required: true, min: 0, max: 5 },
          count: { type: Number, required: true, min: 0 },
        },
      },
    ],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports = Wishlist;
