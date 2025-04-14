const express = require("express");
const {
  getNotifications,
  createNotification,
} = require("../controllers/notification");

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getNotifications);

module.exports = router;
