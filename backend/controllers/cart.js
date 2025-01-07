import { Cart } from "../models/cart.js";

//GET CART PRODUCTS FOR ALL USERS
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

//GET CART PRODUCTS FOR A SINGLE USER
export const getCartsUser = async (req, res) => {
    const {id: userId} = req.params
  try {
    const cartItemsUser = await Cart.find({ userId });
    res.status(200).json(cartItemsUser);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};
