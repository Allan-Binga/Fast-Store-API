const Cart = require("../models/cart");

// ADD PRODUCTS TO CART
const addProductToCart = async (req, res) => {
  try {
    const userId = req.cookies.storeSession;

    // Check if the user is logged in
    if (!userId) {
      return res.status(401).json({ error: "Please log in first." });
    }

    const { products } = req.body;

    // Validate the products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products must be an array with at least one product.",
      });
    }

    for (const product of products) {
      const { _id, title, category, price, quantity, description, image } =
        product;

      // Ensure required fields are provided
      if (
        !_id ||
        !title ||
        !category ||
        !price ||
        !quantity ||
        !description ||
        !image
      ) {
        return res.status(400).json({
          error:
            "Each product must include _id, title, category, price, quantity, description, and image.",
        });
      }

      // Ensure quantity is valid
      if (quantity <= 0) {
        return res.status(400).json({
          error: "Quantity must be greater than zero.",
        });
      }
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Add or update products in the cart
    for (const product of products) {
      const { _id, quantity } = product;

      // Check if the product exists in the cart by _id
      let existingProductIndex = cart.products.findIndex(
        (p) => p._id.toString() === _id.toString()
      );

      if (existingProductIndex !== -1) {
        // Update quantity for the existing product
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // If no matching product, add it to the cart
        cart.products.push(product);
      }
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      error: "An error occurred while adding the product to the cart.",
    });
  }
};

// REMOVE PRODUCTS FROM CART
const removeProductFromCart = async (req, res) => {
  try {
    const userId = req.cookies.storeSession;

    // Check if the user is logged in
    if (!userId) {
      return res.status(401).json({ error: "Please log in first." });
    }

    const { productId } = req.body;

    // Validate the productId
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    // Find the index of the product to remove
    const productIndex = cart.products.findIndex(
      (product) => product._id.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart." });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product removed from cart.", cart });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({
      error: "An error occurred while removing the product from the cart.",
    });
  }
};

//CLEAR CART
const clearCart = async (req, res) => {
  try {
    const userId = req.cookies.storeSession;

    //check if a user is logged in
    if (!userId) {
      return res.status(401).json({ error: "Please log in first." });
    }

    //Find user's cart
    const cart = await Cart.findOne({ userId });

    //If no cart is found return not found
    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    // Clear the products array
    cart.products = [];

    //Save updated cart
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      error: "An error occurred while clearing the cart.",
    });
  }
};

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
  // console.log(`Fetching cart items for user ID: ${userId}`);
  try {
    const cartItemsUser = await Cart.find({ userId });
    // console.log(`Cart items found: ${JSON.stringify(cartItemsUser)}`);
    if (cartItemsUser.length === 0) {
      return res
        .status(404)
        .json({ message: "No cart items found for this user." });
    }
    res.status(200).json(cartItemsUser);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

module.exports = {
  getCart,
  getCartsUser,
  addProductToCart,
  removeProductFromCart,
  clearCart,
};
