const express = require("express");

const {
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/update-password", updatePassword);
router.post("/logout", logoutUser);

module.exports = router;
