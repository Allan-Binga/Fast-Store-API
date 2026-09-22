const Notification = require("../models/notification");
const User = require("../models/users");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");

// Notification lists have a consistent array shape, including empty results.
const getNotifications = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)); });
const createNotification = asyncHandler(async (req, res) => {
  const userId = requireId(req.body.userId), { message, type } = req.body;
  if (typeof message !== "string" || !message.trim() || message.length > 1000) throw fail(400, "Provide a message of 1–1000 characters.");
  if (!await User.exists({ _id: userId })) throw fail(404, "User not found.");
  res.status(201).json(await Notification.create({ userId, message, type }));
});
// Customers may mark only their own notifications as read.
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: requireId(req.params.id), userId: req.userId }, { $set: { read: true } }, { new: true });
  if (!notification) throw fail(404, "Notification not found.");
  res.json(notification);
});
module.exports = { getNotifications, createNotification, markRead };
