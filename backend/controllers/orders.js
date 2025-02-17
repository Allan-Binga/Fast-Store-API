const Order = require("../models/orders");

//Retrieve all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json("Error fetching orders.");
  }
};

module.exports = {
  getOrders,
};
