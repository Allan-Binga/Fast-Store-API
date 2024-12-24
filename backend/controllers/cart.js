import Cart from "../models/cart.js";

//ADD NEW CART
export const addNewCart = async (req, res) => {
  try {
    const { userId, totalItems } = req.body;
    if (!userId || !totalItems) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const newCart = new Cart(req.body);
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (error) {
    res.status(500).json({ error: "Error adding a new cart." });
  }
};

//GET ALL CARTS
export const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find();

    if (!carts || carts.length === 0) {
      return res.status(404).json({ error: "No carts found." });
    }
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: "An error occured while fetching carts" });
  }
};

//LIMIT RESULTS
export const getLimitedCarts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const carts = await Cart.find().limit(limit);
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: "An error occured while limiting carts." });
  }
};

//GET SINGLE CART
export const getSingleCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json();
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error occured while getting cart." });
  }
};

//GET USER CART
export const getUserCart = async (req, res) => {
  const userId = req.params.userId;
  try {
    const userCart = await Cart.findOne({ userId: parseInt(userId) });
    if (!userCart) {
      return res
        .status(404)
        .json({ error: `Cart for user ${userId} not found.` });
    }
    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ error: "Error occured while getting user cart." });
  }
};

//UPDATE CART
export const updatedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, totalItems } = req.body;
    if (!userId || !totalItems) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { userId, totalItems },
      { new: true }
    );
    if (!updatedCart) {
      return res.status(400).json({ error: "Failed to update cart." });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: "Error occured while updating cart." });
  }
};

//DELETE CART
export const deleteCart = async (req, res) => {
  try {
    const product = await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Successfully deleted cart.");
  } catch (error) {
    res.status(500).json({ error: "Error while deleting cart." });
  }
};
