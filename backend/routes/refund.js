const express = require("express");

const {
  authUserMiddleware,
  authAdminMiddleware,
} = require("../middleware/jwt");
const {
  requestRefund,
  getRefunds,
  getRefund,
  getUserRefunds,
  approveRefund,
  rejectRefund,
} = require("../controllers/refund");

const {
  uploadRefundEvidence,
} = require("../middleware/imageUpload");

const router = express.Router();

router.get("/", authAdminMiddleware, getRefunds);
router.get("/user", authUserMiddleware, getUserRefunds);
router.get("/:id", authAdminMiddleware, getRefund);
router.post(
  "/orders/:orderId/request",
  authUserMiddleware,
  uploadRefundEvidence,
  requestRefund,
);
router.post(
  "/:id/approve",
  authAdminMiddleware,
  approveRefund,
);
router.post(
  "/:id/reject",
  authAdminMiddleware,
  rejectRefund,
);

module.exports = router;
