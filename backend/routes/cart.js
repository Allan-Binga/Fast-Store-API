const express = require("express")
const { getCart, getCartsUser } = require("../controllers/cart.js");

const router = express.Router();

router.get("/", getCart)
router.get("/:id", getCartsUser);

module.exports = router
