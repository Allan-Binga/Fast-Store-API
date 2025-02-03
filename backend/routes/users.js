const express = require("express");
const {
  getSingleUser,
  getUsers,
  updatedUser,
} = require("../controllers/users.js");

const router = express.Router();

router.get("/", getUsers);
router.get("/logged-in-user", getSingleUser);
router.patch("/:id", updatedUser);

module.exports = router;
