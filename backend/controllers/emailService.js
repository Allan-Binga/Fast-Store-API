const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/users");
const { asyncHandler, fail, emailValue } = require("../utils/http");
const { hashToken } = require("../utils/session");

// Initialize integrations only when used; importing the API needs no mail credentials.
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sendMail = async (to, subject, html) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.CLIENT_URL) throw fail(503, "Email service is not configured.");
  const transporter = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } });
  return transporter.sendMail({ from: `"FastStore" <${process.env.MAIL_USER}>`, to, subject, html });
};
const linkMail = (email, token, path, subject) => sendMail(email, subject, `<p>${subject}</p><a href="${escapeHtml(process.env.CLIENT_URL + path + '?token=' + encodeURIComponent(token))}">Continue</a><p>This link expires in 30 minutes.</p>`);
const sendVerificationEmail = (email, token) => linkMail(email, token, "/account-verification", "Verify your FastStore account");
const sendPasswordResetEmail = (email, token) => linkMail(email, token, "/password/reset", "Reset your FastStore password");
const sendAccountConfirmationEmail = email => sendMail(email, "Account verified", `<p>Your account is verified.</p><a href="${escapeHtml(process.env.CLIENT_URL)}">Start shopping</a>`);
const sendOrderConfirmationEmail = (email, order) => sendMail(email, "Order confirmation", `<p>Order ${escapeHtml(order._id)}</p><ul>${order.items.map(item => `<li>${escapeHtml(item.name)} — ${item.quantity} × $${item.price.toFixed(2)}</li>`).join("")}</ul><p>Total: $${order.totalAmount.toFixed(2)}</p>`);

// Verification tokens are single-use and consumed before sending optional confirmation.
const verifyUser = asyncHandler(async (req, res) => {
  if (typeof req.query.token !== "string" || !/^[a-f\d]{64}$/i.test(req.query.token)) throw fail(400, "Invalid or expired token.");
  const user = await User.findOneAndUpdate({ verificationToken: hashToken(req.query.token), verificationTokenExpiry: { $gt: new Date() } }, { $set: { isVerified: true }, $unset: { verificationToken: 1, verificationTokenExpiry: 1 } }, { new: true });
  if (!user) throw fail(400, "Invalid or expired token. Request a new verification email.");
  try { await sendAccountConfirmationEmail(user.email); } catch { console.error("Account confirmation email could not be delivered."); }
  res.json({ message: "Account verified successfully." });
});
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = emailValue(req.body.email);
  const user = await User.findOne({ email, isVerified: false });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id, isVerified: false }, { $set: { verificationToken: hashToken(token), verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000) } });
    try { await sendVerificationEmail(email, token); } catch { console.error("Verification email could not be delivered."); }
  }
  res.json({ message: "If verification is needed, an email will be sent. You can request another link if needed." });
});

// Reuse the recovery controller lazily to avoid a circular module dependency.
const resendPasswordResetEmail = (req, res, next) => require("./password").resetPasswordEmail(req, res, next);
const verifyPasswordResetToken = asyncHandler(async (req, res) => {
  if (typeof req.query.token !== "string" || !/^[a-f\d]{64}$/i.test(req.query.token)) throw fail(400, "Invalid or expired token.");
  const user = await User.findOne({ passwordResetToken: hashToken(req.query.token), passwordResetTokenExpiry: { $gt: new Date() } });
  if (!user) throw fail(400, "Invalid or expired token.");
  res.json({ message: "Token is valid." });
});
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendAccountConfirmationEmail, sendOrderConfirmationEmail, verifyUser, resendVerificationEmail, resendPasswordResetEmail, verifyPasswordResetToken };
