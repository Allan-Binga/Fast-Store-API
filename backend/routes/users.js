const express = require("express");
const {
  getSingleUser,
  getUsers,
  updatedUser,
} = require("../controllers/users.js");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getSingleUser);
router.patch("/:id", updatedUser);

module.exports = router;
