const express = require("express");
const {
  verifyUser,
  resendVerificationEmail,
  resendPasswordResetEmail, verifyPasswordResetToken
} = require("../controllers/emailService");

const router = express.Router();

//Routes
router.get("/", verifyUser);
router.get("/password/token", verifyPasswordResetToken)
router.post("/resend/account/verification", resendVerificationEmail);
router.post("/resend/password/reset", resendPasswordResetEmail);

module.exports = router;
