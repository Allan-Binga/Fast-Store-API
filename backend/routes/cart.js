const express = require("express")
const { getCart, getCartsUser, removeProductFromCart, clearCart } = require("../controllers/cart.js");

const router = express.Router();

router.get("/", getCart)
router.get("/:id", getCartsUser);
router.delete("/remove", removeProductFromCart)
router.delete("/clear", clearCart)

module.exports = router
