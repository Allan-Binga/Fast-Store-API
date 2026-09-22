const mongoose = require("mongoose");
// One wishlist per customer, with stable references to the product catalog.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true } }],
}, { timestamps: true });
module.exports = mongoose.model("Wishlist", schema);
