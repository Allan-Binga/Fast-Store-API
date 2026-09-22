const User = require("../models/users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("./emailService");
const { asyncHandler, fail, emailValue, passwordValid } = require("../utils/http");
const { hashToken, clearCookies } = require("../utils/session");

// Recovery requests use the same response for known and unknown addresses.
const resetPasswordEmail = asyncHandler(async (req, res) => {
  const email = emailValue(req.body.email);
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = hashToken(token);
    await User.updateOne({ _id: user._id }, { $set: { passwordResetToken: hash, passwordResetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000) } });
    try { await sendPasswordResetEmail(email, token); }
    catch { console.error("Password recovery email could not be delivered."); }
  }
  res.json({ message: "If an account exists, a password reset email will be sent. You can request another link if needed." });
});

// Both password-change flows enforce the same validation policy.
const validatePassword = (body) => {
  if (!passwordValid(body.newPassword)) throw fail(400, "Use a strong password of at least 8 characters (maximum 72 bytes).");
  if (body.newPassword !== body.confirmPassword) throw fail(400, "Passwords do not match.");
};
const revoke = { sessionId: 1, refreshTokenHash: 1, passwordResetToken: 1, passwordResetTokenExpiry: 1 };
const resetPassword = asyncHandler(async (req, res) => {
  validatePassword(req.body);
  const user = await User.findById(req.userId).select("+password");
  if (!user || typeof req.body.currentPassword !== "string" || !await bcrypt.compare(req.body.currentPassword, user.password)) throw fail(401, "Current password is incorrect.");
  const updated = await User.updateOne({ _id: user._id, password: user.password }, { $set: { password: await bcrypt.hash(req.body.newPassword, 12) }, $unset: revoke });
  if (updated.modifiedCount !== 1) throw fail(409, "Password changed concurrently. Please sign in again.");
  clearCookies(res);
  res.json({ message: "Password updated. Please sign in again." });
});

// Consume reset tokens with the password update in one atomic operation.
const resetPasswordToken = asyncHandler(async (req, res) => {
  validatePassword(req.body);
  if (typeof req.body.token !== "string" || !/^[a-f\d]{64}$/i.test(req.body.token)) throw fail(400, "Invalid or expired token.");
  const user = await User.findOneAndUpdate({ passwordResetToken: hashToken(req.body.token), passwordResetTokenExpiry: { $gt: new Date() } }, { $set: { password: await bcrypt.hash(req.body.newPassword, 12) }, $unset: revoke });
  if (!user) throw fail(400, "Invalid or expired token.");
  clearCookies(res);
  res.json({ message: "Password reset. Please sign in again." });
});
module.exports = { resetPasswordEmail, resetPassword, resetPasswordToken };
