const Order = require("../models/orders");

//Retrieve all orders
const getOrders = async (_req, res) => {
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

//Retrieve user's order
const getUserOrder = async (req, res) => {
  try {
    //Get ID storeSession cookie.
    const loggedInUser = req.userId;

    if(!loggedInUser) {
      return res.status(401).json({error: "Not authenticated to perform this action."})
    }

    const userOrders = await Order.find({ user: loggedInUser });

    //Handle case where no orders exist
    if (!userOrders) {
      return res.status(404).json({ error: "No orders found for this user" });
    }

    return res.status(200).json(userOrders);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error occured while fetching orders." });
  }
};

module.exports = {
  getOrders,
  getUserOrder,
};
