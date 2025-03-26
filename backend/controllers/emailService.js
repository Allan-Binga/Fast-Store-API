const nodemailer = require("nodemailer");
const User = require("../models/users");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

//Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/account-verification?token=${token}`;

  const mailOptions = {
    from: `"FastStore API" <${process.env.MAIL_USER}>`, //Name and Email
    to: email,
    subject: "Account verification.",
    html: `  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Verify Your Account</h2>
          <p style="color: #555;">Click the button below to verify your account.</p>
          <a href="${verificationUrl}" 
            style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #2582b8; color: #fff; text-decoration: none; border-radius: 5px;">
            Verify My Account
          </a>
          <p style="margin-top: 20px; color: #777;">If you did not create an account, you can ignore this email.</p>
        </div>
      </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw error; // Re-throw to handle in the calling function
  }
};

//Confirmation email after verifying account successfsully.
const sendAccountConfirmationEmail = async (email) => {
  const mailOptions = {
    from: `"FastStore API" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Account Verified Successfully!",
    html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745;"> Account verification successful.</h2>
          <p style="color: #555;">Thank you for verifying your account. You can now start shopping.</p>
          <a href="http://localhost:3100" 
            style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
            Start Shopping 🛒
          </a>
          <p style="margin-top: 20px; color: #777;">Happy Shopping! 🛍️</p>
        </div>
      </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Thank you email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending thank you email to ${email}:`, error);
    throw error;
  }
};

//Resends the verification link expires.
const resendVerificationEmail = async (req, res) => {
  try {
    console.log("Request received:", req.body); // Log incoming request data

    const { email } = req.body;

    if (!email) {
      console.error("❌ Error: No email provided");
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user); // Log the user object

    if (!user) {
      console.error("❌ Error: User not found");
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      console.error("⚠️ Warning: User already verified");
      return res.status(400).json({ message: "User is already verified." });
    }

    // Generate a new token and expiration time
    const plainToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    user.verificationTokenExpiry = Date.now() + 2 * 60 * 1000;
    console.log("New token generated:", user.verificationToken);

    await user.save();
    console.log("✅ User saved with new token");

    // Send new verification email
    await sendVerificationEmail(user.email, user.verificationToken);
    console.log("📧 Verification email sent to:", user.email);

    res.json({ message: "New verification email sent." });
  } catch (error) {
    console.error("🔥 Internal Server Error:", error); // Log the actual error
    res.status(500).json({ message: "Internal server error" });
  }
};

//Order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
  const mailOptions = {
    from: `"FastStore" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Order Confirmation - FastStore",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745;">Your Order is Confirmed! ✅</h2>
          <p>Thank you for shopping with us! Your order <b>#${
            order._id
          }</b> has been successfully placed.</p>
          <h3>Order Summary:</h3>
          <ul style="text-align: left;">
            ${order.items
              .map(
                (item) =>
                  `<li>${item.name} - ${item.quantity} x $${item.price}</li>`
              )
              .join("")}
          </ul>
          <p><b>Total Amount:</b> $${order.totalAmount.toFixed(2)}</p>
          <p style="margin-top: 20px;">We will notify you when your order is shipped. 🚀</p>
        </div>
      </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending order confirmation email:`, error);
    throw error;
  }
};

// Password Reset Email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"FastStore API" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555;">Click the button below to reset your password.</p>
          <a href="${resetUrl}" 
            style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #ff9800; color: #fff; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #777;">If you did not request this, ignore this email.</p>
        </div>
      </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending password reset email:`, error);
    throw error;
  }
};

//Function to verify the user &  verification token
const verifyUser = async (req, res) => {
  try {
    const { token } = req.query;

    // Hash the incoming token before searching
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    //Check if the token has expired
    if (user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({
        message:
          "Token expired. Please request a new verification email.",
        // email: user.email
      });
    }

    user.isVerified = true;
    // user.verificationToken = undefined; // // Remove token after verification
    user.verificationTokenExpiry = undefined;
    await user.save();

    //Send Thank you email
    await sendAccountConfirmationEmail(user.email);

    res.json({ message: "Account verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Function thaty verifies the reset-password email token.
const verifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    // Hash the token to compare it with the stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    //Check if the token has expired
    if (user.passwordResetTokenExpiry < Date.now()) {
      return res
        .status(400)
        .json({
          message:
            "Password reset token expired. Please request a new verification email.",
        });
    }

    res.json({ message: "Token is valid.", email: user.email });
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  sendVerificationEmail,
  sendAccountConfirmationEmail,
  resendVerificationEmail,
  sendOrderConfirmationEmail,
  verifyUser,
  sendPasswordResetEmail,
};
