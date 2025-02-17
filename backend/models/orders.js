const mongoose = require("mongoose");

//ORDER SCHEMA
const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
