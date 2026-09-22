// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const { createMessage } = require("../controllers/phoneService");

const router = express.Router();

router.post("/", authUserMiddleware, authAdminMiddleware, createMessage);

module.exports = router