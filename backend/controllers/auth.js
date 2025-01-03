import User from "../models/users.js";
import OAuthUser from "../models/oauth.js";
import bcrypt from "bcrypt";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

//REGISTER NEW USER
export const createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {}
};

//GOOGLE OAUTH IMPLEMENTATION
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5500/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Check if user already exists in the database
  const user = await OAuthUser.findOne({ googleId: profile.id });
  if (!user) { //If there's no uses it creates one.
    // Create a new user in the database
    const newUser = new OAuthUser({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value
    });
    await newUser.save();
    return done(null, newUser);
  }
  return done(null, user);
}));


//LOGIN REGISTERED USER
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json("Wrong username or password.");
    }

    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      return res.status(400).json("Wrong password.");
    }

    //COOKIE FOR ENABLING LOGOUT
    res.cookie("storeSession", user._id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(200).json("Login successful.");
  } catch (error) {
    res.status(500).json({ error: "Error logging in." });
  }
};

//LOGOUT USER
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("storeSession");
    res.status(200).json({message: "Logout successful."})
  } catch (error) {
    res.status(500).json({error: "Error logging out."})
  }
};
