const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/users");
const { asyncHandler, fail, emailValue } = require("../utils/http");
const { hashToken } = require("../utils/session");

const { sendMail, escapeHtml, template, money } = require("../services/email");
const linkMail = (email, token, path, subject) => sendMail(email, subject, template(subject, "Use the button below to continue. This secure link expires in 30 minutes. If you did not request this, you can ignore this email.", "", { label: "Continue securely", path: path + '?token=' + encodeURIComponent(token) }));
const sendVerificationEmail = (email, token) => linkMail(email, token, "/account-verification", "Verify your FastStore account");
const sendPasswordResetEmail = (email, token) => linkMail(email, token, "/password/reset", "Reset your FastStore password");
const sendAccountConfirmationEmail = email => sendMail(email, "Welcome to FastStore", template("You're ready to shop", "Your email is verified. Discover your next favorite find.", "", { label: "Explore the store", path: "/" }));
const sendOrderConfirmationEmail = (email, order) => {
  const reference = `FS-${String(order._id).toUpperCase()}`;
  const rows = order.items.map(item => `<tr><td style="padding:12px 8px;border-bottom:1px solid #eaedff">${escapeHtml(item.name)}</td><td style="padding:12px 8px">${item.quantity}</td><td style="padding:12px 8px">${money(item.price, order.currency)}</td><td style="padding:12px 8px">${money(item.price * item.quantity, order.currency)}</td></tr>`).join("");
  const details = `<p><strong>Receipt ${escapeHtml(reference)}</strong><br>Paid: ${escapeHtml(new Date(order.paidAt || order.createdAt).toISOString())}<br>Payment: ${escapeHtml(order.paymentProvider)}<br>Reference: ${escapeHtml(order.stripePaymentIntentId || order.paypalCaptureId || order.mpesaReceiptNumber || order._id)}</p><table role="table" style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f2f3ff;text-align:left"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p style="text-align:right;font-size:22px;color:#004ac6"><strong>Total paid ${money(order.totalAmount, order.currency)}</strong></p><p style="font-size:12px;color:#737686">Keep this receipt for your records. Refunds, if any, are confirmed separately.</p>`;
  return sendMail(email, `Your FastStore receipt · ${reference}`, template("Thank you for your purchase", "Your payment is confirmed and your delivery is requested. We will email you when delivery starts. Here is your itemized receipt.", details, { label: "View your order", path: `/payment-result?order_id=${order._id}` }));
};

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

//Verify Password reset token
const verifyPasswordResetToken = asyncHandler(async (req, res) => {
  if (typeof req.query.token !== "string" || !/^[a-f\d]{64}$/i.test(req.query.token)) throw fail(400, "Invalid or expired token.");
  const user = await User.findOne({ passwordResetToken: hashToken(req.query.token), passwordResetTokenExpiry: { $gt: new Date() } });
  if (!user) throw fail(400, "Invalid or expired token.");
  res.json({ message: "Token is valid." });
});

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendAccountConfirmationEmail, sendOrderConfirmationEmail, verifyUser, resendVerificationEmail, resendPasswordResetEmail, verifyPasswordResetToken };
