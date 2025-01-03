import express from "express";
import { createUser, loginUser, logoutUser } from "../controllers/auth.js";
import passport from "passport";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

//GOOGLE OAUTH ROUTES
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

export default router;
