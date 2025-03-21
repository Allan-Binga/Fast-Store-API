const express = require("express")
const {verifyUser, resendVerificationEmail} = require("../controllers/emailService")

const router = express.Router()

//Routes
router.get("/", verifyUser)
router.post("/resend-verification", resendVerificationEmail)

module.exports = router