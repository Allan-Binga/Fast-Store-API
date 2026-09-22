const User = require("../models/users");
const { asyncHandler, fail, pagination, requireId } = require("../utils/http");

// Admin listing and current-user profile never serialize authentication secrets.
const getUsers = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);
  res.json(await User.find().sort({ _id: 1 }).skip(skip).limit(limit));
});
const getSingleUser = (req, res) => res.json(req.user);

// Profile edits are restricted to the authenticated owner and safe fields.
const updatedUser = asyncHandler(async (req, res) => {
  requireId(req.params.id);
  if (req.params.id !== req.userId) throw fail(403, "You can only update your account.");
  const allowed = ["firstName", "lastName", "phone"];
  if (Object.keys(req.body).some(key => !allowed.includes(key))) throw fail(400, "Only firstName, lastName and phone may be updated here.");
  if (!Object.keys(req.body).length || Object.values(req.body).some(v => typeof v !== "string" || !v.trim())) throw fail(400, "Provide valid profile fields.");
  const user = await User.findByIdAndUpdate(req.userId, { $set: req.body }, { new: true, runValidators: true });
  if (!user) throw fail(404, "User not found.");
  res.json(user);
});
module.exports = { getUsers, getSingleUser, updatedUser };
