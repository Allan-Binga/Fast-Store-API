const Cart = require("../models/cart");
const Product = require("../models/product");

//ADD PRODUCTS TO CART
const addProductToCart = async (req, res) => {
  try {
    // Parse the cookie to extract userId
    const userId = req.userId;

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

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    for (const { productId, quantity } of products) {
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required." });
      }

      // Fetch product details from the database
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${productId}` });
      }

      // Check if the product is already in the cart
      const existingItem = cart.products.find((item) =>
        item.productId.equals(productId)
      );

      if (existingItem) {
        return res.status(400).json({
          error: "Product exists in cart. Please update quantity.",
        });
      } else {
        // Add new product with fetched details
        cart.products.push({
          productId: product._id,
          name: product.name,
          price: product.currentPrice,
          image: product.image,
          quantity,
        });
      }
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Added to cart successfully." });
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
    const userId = req.userId;

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
      (product) => product.productId.toString() === productId.toString()
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
    const userId = req.userId;

    //Find user's cart
    const cart = await Cart.findOne({ userId });

    //If no cart is found return not found
    if (!cart) {
      return res.status(404).json({ error: "No cart found to clear." });
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
const getCartUser = async (req, res) => {
  try {
    // Get the authenticated user's ID from cookies
    const loggedInUserId = req.userId;

    // Check if the session cookie exists
    if (!loggedInUserId) {
      return res.status(401).json({ error: "Please log in to proceed." });
    }

    // Find the wishlist for the authenticated user
    const userCart = await Cart.findOne({
      userId: loggedInUserId,
    }).populate("products");

    // Handle case where no cart exists for the user
    if (!userCart) {
      return res
        .status(404)
        .json({ error: "No cart found for the logged-in user." });
    }

    // Return the cart if it exists
    return res.status(200).json(userCart);
  } catch (error) {
    console.error("Error fetching user's cart:", error);
    return res
      .status(500)
      .json({ error: "Error occured while fetching cart." });
  }
};

module.exports = {
  getCart,
  getCartUser,
  addProductToCart,
  removeProductFromCart,
  clearCart,
};
