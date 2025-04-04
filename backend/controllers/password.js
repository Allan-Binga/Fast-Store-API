const { sendPasswordResetEmail } = require("./emailService");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//Reset Password
const resetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a password reset token
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpiry = Date.now() + 2 * 60 * 1000; // 2 mins expiry

    await user.save();

    // Send email with the plain token (not hashed)
    await sendPasswordResetEmail(user.email, plainToken);

    return res.json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//RESET/CHANGE PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // VALIDATE INPUT FIELDS
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Current password, new password, and confirm password are required!",
      });
    }

    // ENSURE NEW PASSWORD AND CONFIRM PASSWORD MATCH
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match.",
      });
    }

    // FETCH USER FROM DATABASE
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // VALIDATE OLD PASSWORD
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // ENSURE NEW PASSWORD IS DIFFERENT FROM THE CURRENT PASSWORD
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
      });
    }

    // VALIDATE NEW PASSWORD STRENGTH
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // HASH NEW PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // UPDATE PASSWORD IN DATABASE
    user.password = hashedPassword;
    await user.save(); // Ensure the update is saved before clearing the session

    // CLEAR SESSION COOKIE
    res.clearCookie("storeSession");

    res
      .status(200)
      .json({ message: "Password updated successfully. Please log in again." });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "Error updating password.", error: error.message });
  }
};

module.exports = { resetPasswordEmail, resetPassword };
