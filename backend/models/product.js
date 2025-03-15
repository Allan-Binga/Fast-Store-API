const mongoose = require("mongoose");

//PRODUCT SCHEMA
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    reviews: {
      rate: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    newArrival: { 
      type: Boolean, 
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
