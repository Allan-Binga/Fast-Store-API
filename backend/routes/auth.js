const express = require("express");

const {
  loginUser,
  logoutUser,
  createUser,
  updatePassword,
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.patch("/update-password", updatePassword);
router.post("/logout", logoutUser);

module.exports = router;
