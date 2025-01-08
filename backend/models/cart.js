import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      title: {
        type: String, // Title of the product
        required: true,
      },
      description: {
        type: String, // Short description of the product
        required: true,
      },
      price: {
        type: Number, // Price of the product in dollars
        required: true,
      },
      quantity: {
        type: Number, // Quantity of the product
        required: true,
        min: 1,
      },
      image: {
        type: String, // Optional field for the product image URL
      },
    },
  ],
});

export const Cart = mongoose.model("Cart", cartSchema);
