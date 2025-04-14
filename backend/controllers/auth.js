const User = require("../models/users");
const Notification = require("../models/notification");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("./emailService");

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
    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    const verificationTokenExpiry = Date.now() + 2 * 60 * 1000;

    // CREATE NEW USER
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword, //Store Hashed Password
      isVerified: false,
      verificationToken: hashedToken, //Store Hashed Token
      verificationTokenExpiry,
    });

    await newUser.save();

    //Send email
    await sendVerificationEmail(email, plainToken);
    await Notification.create({
      userId: newUser._id,
      message: "Thank you for registering.",
      type: "signup",
    });
    res.status(201).json({
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
      return res.status(400).json("Invalid email or password.");
    }

    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      return res.status(400).json("Invalid credentials. Please try again.");
    }

    //GENERATE JWT token
    const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // COOKIE FOR ENABLING LOGOUT
    res.cookie("storeSession", token, {
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

//cHECK IF USER IS LOGGED IN
const checkLogin = async (req, res) => {
  try {
    const token = req.cookies.storeSession;
    if (!token) {
      return res.status(401).json({ isLoggedIn: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isLoggedIn: true, userId: decoded.user });
  } catch (error) {
    return res.status(401).json({ isLoggedIn: false });
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

module.exports = { registerUser, loginUser, logoutUser, checkLogin };
