const express = require("express")
const {verifyUser} = require("../controllers/emailService")

const router = express.Router()

//Routes
router.get("/", verifyUser)

module.exports = router