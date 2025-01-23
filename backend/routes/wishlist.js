const express = require("express");
const {
  getWishlists, getUserWishlist, 
  addProductToWishlist, removeProductWishlist
} = require("../controllers/wishlist");

const router = express.Router();

//ROUTES
router.get("/", getWishlists);
router.post("/", addProductToWishlist);
router.get("/:id", getUserWishlist)
router.delete("/", removeProductWishlist)

module.exports = router;
