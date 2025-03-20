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
    from: "allanbinga73@gmail.com",
    to: email,
    subject: "Click the link below to verify your account",
    html: `<p>Click the link below to verify your account:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error){
    console.error(`Error sending email to ${email}:`, error);
    throw error; // Re-throw to handle in the calling function
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

    res.json({message: "Account verified successfully."})
  } catch (error) {
    res.status(500),j
  }
};

module.exports = { sendVerificationEmail, verifyUser };
