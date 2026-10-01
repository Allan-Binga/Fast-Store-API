const express = require("express");
const {
  getCheckouts,
  createCheckoutSession,
  resumeCheckoutSession,
} = require("../controllers/checkout.js");
const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/jwt");
const {
  createPayPalOrder,
  capturePayPalOrder,
} = require("../controllers/paypalCheckout");
const { createMpesaStkPush } = require("../controllers/daraja");

const router = express.Router();

router.get("/", authAdminMiddleware, getCheckouts);

router.post(
  "/create-checkout-session",
  authUserMiddleware,
  createCheckoutSession,
);
router.post(
  "/resume-checkout-session",
  authUserMiddleware,
  resumeCheckoutSession,
);

router.post("/paypal/orders", authUserMiddleware, createPayPalOrder);
router.post(
  "/paypal/orders/:paypalOrderId/capture",
  authUserMiddleware,
  capturePayPalOrder,
);
router.post("/mpesa/stk-push", authUserMiddleware, createMpesaStkPush);

module.exports = router;
