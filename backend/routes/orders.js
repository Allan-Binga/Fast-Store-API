// Protect customer data and reserve management actions for administrators.
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/jwt");
const express = require("express");
const {
  getOrders,
  getOrder,
  getUserOrder,
  getPaymentStatus,
} = require("../controllers/orders");

const router = express.Router();

//ROUTES
router.get("/", authAdminMiddleware, getOrders);
router.get("/user", authUserMiddleware, getUserOrder);
router.get("/payment-status", authUserMiddleware, getPaymentStatus);
router.get("/:id", authAdminMiddleware, getOrder);

module.exports = router;
