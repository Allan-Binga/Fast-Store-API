const express = require("express");
const passport = require("passport");
const { loginUser, logoutUser, createUser } = require("../controllers/auth");

const router = express.Router();

router.post("/register", createUser)
router.post("/login", loginUser);
router.post("/logout", logoutUser);

module.exports = router;