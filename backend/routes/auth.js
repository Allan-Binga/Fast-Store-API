const express = require("express");

const { loginUser, logoutUser, registerUser } = require("../controllers/auth");
const { resetPassword } = require("../controllers/password");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.patch("/reset-password", resetPassword);

module.exports = router;
