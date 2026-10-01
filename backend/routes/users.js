// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getSingleUser,
  getUsers,
  getAdminUser,
  updatedUser,
} = require("../controllers/users.js");

const router = express.Router();

router.get("/", authAdminMiddleware, getUsers);
router.get("/logged-in-user", authUserMiddleware, getSingleUser);
router.get("/:id", authAdminMiddleware, getAdminUser);
router.patch("/:id", authUserMiddleware, updatedUser);

module.exports = router;
