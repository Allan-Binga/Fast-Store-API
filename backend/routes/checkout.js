const express = require("express");
const { createCheckoutSession } = require("../controllers/checkout.js");
const { authUserMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/create-checkout-session", authUserMiddleware ,createCheckoutSession);

module.exports = router;
