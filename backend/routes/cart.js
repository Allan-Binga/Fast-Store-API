// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getCart,
  getCartUser,
  removeProductFromCart,
  clearCart,
  updateQuantity,
} = require("../controllers/cart.js");

const router = express.Router();

router.get("/", authUserMiddleware, authAdminMiddleware, getCart);
router.get("/user", authUserMiddleware, getCartUser);
router.delete("/remove", authUserMiddleware, removeProductFromCart);
router.delete("/clear", authUserMiddleware, clearCart);

// Persist quantity edits for the authenticated customer.
router.patch("/quantity", authUserMiddleware, updateQuantity);
module.exports = router;
