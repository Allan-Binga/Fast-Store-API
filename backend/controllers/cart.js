const Cart = require("../models/cart");
//GET CART PRODUCTS FOR ALL USERS
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

//GET CART PRODUCTS FOR A SINGLE USER
const getCartsUser = async (req, res) => {
  const { id: userId } = req.params;
  console.log(`Fetching cart items for user ID: ${userId}`);
  try {
    const cartItemsUser = await Cart.find({ userId });
    console.log(`Cart items found: ${JSON.stringify(cartItemsUser)}`);
    if (cartItemsUser.length === 0) {
      return res.status(404).json({ message: "No cart items found for this user." });
    }
    res.status(200).json(cartItemsUser);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

module.exports = { getCart, getCartsUser };
