// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const { getOrders, getUserOrder } = require("../controllers/orders");

const router = express.Router();

//ROUTES
router.get("/", authUserMiddleware, authAdminMiddleware, getOrders);
router.get("/user", authUserMiddleware, getUserOrder);

module.exports = router;
