const express = require("express");
const passport = require("passport");
const { loginUser, logoutUser } = require("../controllers/auth");

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

// GOOGLE OAUTH ROUTES
// Route to start Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Route to redirect to after successful Google OAuth login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect user after successful login (can be a dashboard or homepage)
    res.redirect("/profile");
  }
);

module.exports = router;