const nodemailer = require("nodemailer");
const User = require("../models/users");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:5500/api/verify?token=${token}`;

  const mailOptions = {
    from: `"FastStore API" <${process.env.MAIL_USER}>`, //Name and Email
    to: email,
    subject: "Account verification.",
    html: `  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Verify Your Account</h2>
          <p style="color: #555;">Click the button below to verify your account.</p>
          <a href="${verificationUrl}" 
            style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px;">
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

const verifyUser = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined; // Remove token after verification
    await user.save();

    //Send Thank you email
    await sendAccountConfirmationEmail(user.email);

    res.json({ message: "Account verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendVerificationEmail,
  sendAccountConfirmationEmail,
  verifyUser,
};
