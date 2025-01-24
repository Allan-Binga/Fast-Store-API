const Wishlist = require("../models/wishlist");
const Cart = require("../models/cart");

//GETTING all USERS WISHLIST
const getWishlists = async (_req, res) => {
  try {
    const wishList = await Wishlist.find();
    res.status(200).json(wishList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlists." });
  }
};

//GET SINGLE USER'S WISHLIST
const getUserWishlist = async (req, res) => {
  try {
    // Assuming the user's ID is stored in cookies
    const userId = req.cookies.storeSession;

    if (!userId) {
      return res.status(401).json({ error: "Please login to proceed." });
    }

    // Find the wishlist for the logged-in user
    const userWishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

    if (!userWishlist) {
      return res
        .status(404)
        .json({ error: "Wishlist not found for this user." });
    }

    res.status(200).json(userWishlist);
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    res.status(500).json({ error: "Failed to fetch user's wishlist." });
  }
};

//ADD PRODUCT TO WISHLIST
const addProductToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.cookies.storeSession;
  //IF NO LOGIN COOKIE, RETURN WITH STATUS 401.
  if (!userId) {
    return res.status(401).json({ error: "Please log in first." });
  }

  try {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.status(200).json("Product added to wishlist.");
    } else {
      return res.status(400).json("Product already exists in wishlist.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Invalid product ID.");
  }
};

//REMOVE PRODUCT FROM WISHLIST
const removeProductWishlist = async (req, res) => {
  try {
    // Extract the user ID from cookies and the product ID from the request body
    const userId = req.cookies.storeSession;
    const { productId } = req.body;

    //VALIDATE LOGGED IN USER
    if (!userId) {
      return res.status(401).json("Please log in to perform this action.");
    }

    //VALIDATE PRODUCTID EXISTENCE
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    // Find the user's wishlist
    const userWishlist = await Wishlist.findOne({ user: userId });

    if (!userWishlist) {
      return res
        .status(404)
        .json({ error: "Wishlist not found for this user." });
    }

    //CHECK IF PRODUCT EXISTS IN THE WISHLIST
    if (!userWishlist.products.includes(productId)) {
      return res.status(400).json("Product not found in the wishlist.");
    }

    // Remove the product from the products array
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true } // Return the updated document
    ).populate("products");

    res.status(200).json({
      message: "Product removed from wishlist successfully.",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({ error: "Failed to remove product from wishlist." });
  }
};

//ADD WISHLIST PRODUCTS TO CART
// ADD WISHLIST PRODUCTS TO CART
const addWishlistToCart = async (req, res) => {
  // EXTRACT storeSession SESSION COOKIE
  const userId = req.cookies.storeSession;
  // IF THERE'S NO COOKIE RETURN WITH STATUS 401
  if (!userId) {
    return res.status(401).json("Please login to perform this action.");
  }

  try {
    // RETRIEVE USER'S WISHLIST WITH PRODUCT DETAILS
    const userWishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

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
      // Check if product already exists in cart
      if (!userCart.products.some((p) => p._id && p._id.equals(product._id))) {
        userCart.products.push({
          _id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          quantity: 1, // Default quantity to 1
          image: product.image || undefined, // Use undefined for optional fields if not present
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

//EXPORT FUNCTION
module.exports = {
  getWishlists,
  getUserWishlist,
  addProductToWishlist,
  removeProductWishlist,
  addWishlistToCart,
};
