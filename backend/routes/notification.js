// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getNotifications,
  createNotification,
  markRead,
} = require("../controllers/notification");

const router = express.Router();

router.post("/", authUserMiddleware, authAdminMiddleware, createNotification);
router.get("/user", authUserMiddleware, getNotifications);

// Customer-owned read receipts.
router.patch("/:id/read", authUserMiddleware, markRead);
module.exports = router;
