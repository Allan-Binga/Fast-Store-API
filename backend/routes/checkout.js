const express = require("express");
const { createCheckoutSession } = require("../controllers/checkout.js");
const { authMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/create-checkout-session", authMiddleware ,createCheckoutSession);

module.exports = router;
