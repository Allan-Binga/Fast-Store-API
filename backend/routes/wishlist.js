const express = require("express");
const {
  getWishlists,
  getUserWishlist,
  addProductToWishlist,
  removeProductWishlist,
  addWishlistToCart,
} = require("../controllers/wishlist");

const router = express.Router();

//ROUTES
router.get("/", getWishlists);
router.post("/add-to-wishlist", addProductToWishlist);
router.get("/user", getUserWishlist);
router.delete("/", removeProductWishlist);
router.post("/add-to-cart", addWishlistToCart);

module.exports = router;
