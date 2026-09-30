const express = require("express");

const {
  authAdminMiddleware,
} = require("../middleware/jwt");
const {
  getStockMetrics,
  getInventoryMovements,
  adjustStock,
} = require("../controllers/stock");

const router = express.Router();

router.get(
  "/metrics",
  authAdminMiddleware,
  getStockMetrics,
);
router.get(
  "/movements",
  authAdminMiddleware,
  getInventoryMovements,
);
router.post(
  "/:productId/adjust",
  authAdminMiddleware,
  adjustStock,
);

module.exports = router;
