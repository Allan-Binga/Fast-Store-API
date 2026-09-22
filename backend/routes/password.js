const express = require("express");
const {
  resetPasswordEmail,
  resetPassword, resetPasswordToken
} = require("../controllers/password");
const { authUserMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/send/email", resetPasswordEmail);
router.put("/reset/password", authUserMiddleware, resetPassword);
router.put("/reset/password/token", resetPasswordToken)

module.exports = router;
