const express = require("express");

const {
  loginUser,
  logoutUser,
  registerUser,
  checkLogin,
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-session", checkLogin);

module.exports = router;
