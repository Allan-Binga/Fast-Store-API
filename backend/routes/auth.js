const express = require("express");

const { loginUser, logoutUser, registerUser } = require("../controllers/auth");
const { resetPassword } = require("../controllers/password");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/reset-password", resetPassword);
router.post("/logout", logoutUser);

module.exports = router;
