const User = require("../models/users");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { sendVerificationEmail } = require("./emailService");
const crypto = require("crypto");

dotenv.config();

// REGISTER NEW USER
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // CHECK IF REQUIRED FIELDS EXIST
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        message:
          "All fields are required: firstName, lastName, email, phone, and password.",
      });
    }

    // VALIDATE EMAIL FORMAT
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // VALIDATE PASSWORD STRENGTH
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // CHECK IF USER ALREADY EXISTS (EMAIL OR PHONE)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email or phone!" });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //GENERATE VERIFICATION TOKEN
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // CREATE NEW USER
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    await newUser.save();

    //Send email
    await sendVerificationEmail(email, verificationToken);
    res
      .status(201)
      .json({
        message:
          "Registration successful. Please check your email for a verification link.",
      });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};

// LOGIN REGISTERED USER
const loginUser = async (req, res) => {
  try {
    // Check if the user is already logged in by looking for the session cookie
    if (req.cookies && req.cookies.storeSession) {
      return res.status(400).json("You are already logged in.");
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json("Wrong email or password.");
    }

    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      return res.status(400).json("Wrong password.");
    }

    // COOKIE FOR ENABLING LOGOUT
    res.cookie("storeSession", user._id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "None",
      secure: true,
      path: "/",
    });
    res.status(200).json("Login successful.");
  } catch (error) {
    res.status(500).json({ error: "Error logging in." });
  }
};

//LOGOUT USER
const logoutUser = async (req, res) => {
  try {
    //CHECK IF COOKIE SESSION EXISTS
    if (!req.cookies || !req.cookies.storeSession) {
      return res.status(400).json({ message: "No user is logged in." });
    }
    //CLEAR SESSION COOKIE
    res.clearCookie("storeSession");
    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    res.status(500).json({ error: "Error logging out." });
  }
};

//UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const userId = req.cookies.storeSession;

    // CHECK IF THE USER IS LOGGED IN
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Please log in to update your password." });
    }

    const { currentPassword, newPassword } = req.body;

    // VALIDATE INPUT FIELDS
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new password fields are required!",
      });
    }

    // FETCH USER FROM DATABASE
    const user = await User.findOne({ _id: userId });
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

module.exports = { registerUser, loginUser, logoutUser, updatePassword };
