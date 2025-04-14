const express = require("express");
const {
  getNotifications,
  createNotification,
} = require("../controllers/notification");
const { authMiddleware } = require("../middleware/jwt.js");

const router = express.Router();

router.post("/", createNotification);
router.get("/user", authMiddleware, getNotifications);

module.exports = router;
