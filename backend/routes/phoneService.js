// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const { createMessage } = require("../controllers/phoneService");

const router = express.Router();

router.post("/", authAdminMiddleware, createMessage);

module.exports = router