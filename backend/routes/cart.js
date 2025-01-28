const express = require("express")
const { getCart, getCartUser, removeProductFromCart, clearCart } = require("../controllers/cart.js");

const router = express.Router();

router.get("/", getCart)
router.get("/user", getCartUser);
router.delete("/remove", removeProductFromCart)
router.delete("/clear", clearCart)

module.exports = router
