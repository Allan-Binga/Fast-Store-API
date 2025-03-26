const express = require("express");
const {
  getSingleUser,
  getUsers,
  updatedUser,
} = require("../controllers/users.js");
const { resetPassword } = require("../controllers/password");
const{ authMiddleware} = require("../middleware/jwt.js");

const router = express.Router();

router.get("/", getUsers);
router.get("/logged-in-user", authMiddleware, getSingleUser);
router.patch("/:id", updatedUser);
router.patch("/reset-password", resetPassword);

module.exports = router;
