const express = require("express");
const { getOrders, getUserOrder } = require("../controllers/orders");
const { authMiddleware } = require("../middleware/jwt");

const router = express.Router();

//ROUTES
router.get("/", getOrders);
router.get("/user", authMiddleware, getUserOrder);

module.exports = router;
