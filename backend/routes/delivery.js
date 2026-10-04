const express = require("express");

const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/jwt");
const {
  getPendingDeliveries,
  initiateDelivery,
  confirmDelivery,
  getDeliveries,
  getDelivery,
  getUserDeliveries,
} = require("../controllers/delivery");

const router = express.Router();

router.get("/", authAdminMiddleware, getDeliveries);
router.get("/user", authUserMiddleware, getUserDeliveries);
router.get("/pending", authAdminMiddleware, getPendingDeliveries);
router.get("/:id", authAdminMiddleware, getDelivery);
router.post(
  "/orders/:orderId/initiate",
  authAdminMiddleware,
  initiateDelivery,
);
router.post(
  "/:id/confirm",
  authUserMiddleware,
  confirmDelivery,
);

module.exports = router;
