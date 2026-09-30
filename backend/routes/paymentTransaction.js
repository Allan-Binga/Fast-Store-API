const express = require("express");

const {
  authAdminMiddleware,
} = require("../middleware/jwt");
const {
  getFinancialMetrics,
  getPaymentTransactions,
} = require("../controllers/paymentTransaction");

const router = express.Router();

router.get(
  "/",
  authAdminMiddleware,
  getPaymentTransactions,
);
router.get(
  "/metrics",
  authAdminMiddleware,
  getFinancialMetrics,
);

module.exports = router;
