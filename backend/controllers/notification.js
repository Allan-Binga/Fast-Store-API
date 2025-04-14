const Notification = require("../models/notification");
const User = require("../models/users");

//GET ALL NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId)

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "No user found with this ID." });
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    // Check if notifications array is empty
    if (notifications.length === 0) {
      return res
        .status(200)
        .json({ message: "No notifications found for this user." });
    }
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//POST/CREATE NOTIFICATION
const createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = new Notification({ userId, message, type });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotifications, createNotification };
