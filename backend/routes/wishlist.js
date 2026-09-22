// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getWishlists,
  getUserWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  addWishlistToCart,
} = require("../controllers/wishlist");

const router = express.Router();

//ROUTES
router.get("/", authUserMiddleware, authAdminMiddleware, getWishlists);
router.post("/add-to-wishlist", authUserMiddleware, addProductToWishlist);
router.get("/user", authUserMiddleware, getUserWishlist);
router.delete("/", authUserMiddleware, removeProductFromWishlist);
router.post("/add-to-cart", authUserMiddleware, addWishlistToCart);

module.exports = router;
