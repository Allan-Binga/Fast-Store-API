const express = require("express");
const {
  getCart,
  getCartUser,
  removeProductFromCart,
  clearCart,
} = require("../controllers/cart.js");
const { authMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.get("/", getCart);
router.get("/user", authMiddleware, getCartUser);
router.delete("/remove", authMiddleware, removeProductFromCart);
router.delete("/clear", clearCart);

module.exports = router;
