const express = require("express");
const {
  getWishlists,
  getUserWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  addWishlistToCart,
} = require("../controllers/wishlist");
const { authMiddleware } = require("../middleware/jwt");

const router = express.Router();

//ROUTES
router.get("/", getWishlists);
router.post("/add-to-wishlist", authMiddleware, addProductToWishlist);
router.get("/user", authMiddleware, getUserWishlist);
router.delete("/", authMiddleware, removeProductFromWishlist);
router.post("/add-to-cart", authMiddleware, addWishlistToCart);

module.exports = router;
