const express = require("express");
const { createMessage } = require("../controllers/phoneService");

const router = express.Router();

router.post("/", createMessage);

module.exports = router