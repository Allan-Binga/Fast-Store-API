const Wishlist = require("../models/wishlist");
const Cart = require("../models/cart");

//GETTING all USERS WISHLIST
const getWishlists = async (_req, res) => {
  try {
    const wishList = await Wishlist.find().populate("products");
    res.status(200).json(wishList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlists." });
  }
};

// GET SINGLE USER'S WISHLIST
const getUserWishlist = async (req, res) => {
  try {
    // Get the authenticated user's ID from cookies
    const loggedInUserId = req.cookies.storeSession;

    // Check if the session cookie exists
    if (!loggedInUserId) {
      return res.status(401).json({ error: "Please log in to proceed." });
    }

    // Find the wishlist for the authenticated user
    const userWishlist = await Wishlist.findOne({
      user: loggedInUserId,
    }).populate("products");

    // Handle case where no wishlist exists for the user
    if (!userWishlist) {
      return res
        .status(404)
        .json({ error: "No wishlist found for the logged-in user." });
    }

    // Return the wishlist if it exists
    return res.status(200).json(userWishlist);
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the wishlist." });
  }
};

// ADD PRODUCT TO WISHLIST
const addProductToWishlist = async (req, res) => {
  const {
    name,
    currentPrice,
    originalPrice,
    discount,
    category,
    description,
    image,
    reviews,
  } = req.body;
  const userId = req.cookies.storeSession;

  // IF NO LOGIN COOKIE, RETURN WITH STATUS 401
  if (!userId) {
    return res.status(401).json({ error: "Please log in first." });
  }

  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    // Create a new wishlist if none exists
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Ensure products is an array
    if (!Array.isArray(wishlist.products)) {
      wishlist.products = [];
    }

    // Check if product already exists in the wishlist
    const existingProduct = wishlist.products.find(
      (product) => product?.name === name && product?.category === category
    );

    if (!existingProduct) {
      // Add new product to the wishlist
      wishlist.products.push({
        name,
        currentPrice,
        originalPrice,
        discount,
        category,
        description,
        image,
        reviews,
      });
      await wishlist.save();
      return res.status(200).json({ message: "Product added to wishlist." });
    } else {
      return res
        .status(400)
        .json({ error: "Product already exists in wishlist." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while adding the product to the wishlist.",
    });
  }
};

// REMOVE PRODUCT FROM WISHLIST
const removeProductFromWishlist = async (req, res) => {
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

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found." });
    }

    // Find the index of the product to remove
    const productIndex = wishlist.products.findIndex(
      (product) => product._id.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in wishlist." });
    }

    // Remove the product from the wishlist
    wishlist.products.splice(productIndex, 1);

    // Save the updated wishlist
    await wishlist.save();

    res.status(200).json({ message: "Product removed from wishlist." });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({
      error: "An error occurred while removing the product from the wishlist.",
    });
  }
};

// ADD WISHLIST PRODUCTS TO CART
const addWishlistToCart = async (req, res) => {
  // EXTRACT storeSession SESSION COOKIE
  const userId = req.cookies.storeSession;

  // IF THERE'S NO COOKIE, RETURN WITH STATUS 401
  if (!userId) {
    return res.status(401).json("Please login to perform this action.");
  }

  try {
    // RETRIEVE USER'S WISHLIST WITH PRODUCT DETAILS
    const userWishlist = await Wishlist.findOne({ user: userId });

    if (!userWishlist || userWishlist.products.length === 0) {
      return res.status(404).json("No products in wishlist to add to cart.");
    }

    // RETRIEVE THE USER'S CART OR CREATE A NEW ONE IF IT DOESN'T EXIST
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({ userId, products: [] });
    }

    // ADD PRODUCTS FROM WISHLIST TO CART
    for (const product of userWishlist.products) {
      // Check if product already exists in the cart
      if (!userCart.products.some((p) => p._id && p._id.equals(product._id))) {
        userCart.products.push({
          _id: product._id,
          name: product.name,
          description: product.description,
          currentPrice: product.currentPrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          category: product.category,
          image: product.image,
          quantity: 1, // Default quantity to 1
          reviews: product.reviews || {}, // Optional reviews field
        });
      }
    }

    // SAVE UPDATED CART
    await userCart.save();

    res.status(200).json("Added to cart successfully.");
  } catch (error) {
    console.error("Error adding wishlist products to cart:", error);
    res.status(500).json({ error: "Failed to add products to cart." });
  }
};

//EXPORT
module.exports = {
  getWishlists,
  getUserWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  addWishlistToCart,
};
