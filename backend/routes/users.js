const express = require("express");
const {
  deleteUser,
  getSingleUser,
  getUsers,
  updatedUser,
} = require("../controllers/users.js");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getSingleUser);
router.delete("/:id", deleteUser);
router.patch("/:id", updatedUser);

module.exports = router;
