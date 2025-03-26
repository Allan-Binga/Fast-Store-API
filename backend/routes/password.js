const express = require("express");
const { resetPasswordEmail } = require("../controllers/password");

const router = express.Router();

router.post("/send/email", resetPasswordEmail);

module.exports = router;
