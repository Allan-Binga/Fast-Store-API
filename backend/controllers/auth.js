const User = require("../models/users");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");
dotenv.config();

// REGISTER NEW USER
const createUser = async (req, res) => {
  try {
    // CHECK IF EITHER EMAIL OR PHONE EXISTS
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email or phone!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with firstName and lastName instead of username
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in createUser:", error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
};
// LOGIN REGISTERED USER
const loginUser = async (req, res) => {
  try {
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

module.exports = { createUser, loginUser, logoutUser };
