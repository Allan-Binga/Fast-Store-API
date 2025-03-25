const express = require("express");
const {
  verifyUser,
  resendVerificationEmail,
} = require("../controllers/emailService");
const { resetPasswordEmail } = require("../controllers/password");

const router = express.Router();

//Routes
router.get("/", verifyUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/reset-password", resetPasswordEmail);

module.exports = router;
