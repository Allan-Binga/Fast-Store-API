const express = require("express");
const {
  handleWebhook,
  handlePayPalWebhook,
} = require("../controllers/webhook");
const { handleMpesaCallback } = require("../controllers/daraja");

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), handleWebhook);
router.post(
  "/paypal",
  express.json({ limit: "100kb" }),
  handlePayPalWebhook,
);
router.post(
  "/mpesa",
  express.json({ limit: "100kb" }),
  handleMpesaCallback,
);

module.exports = router;
