const express = require("express");
const {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address");
const { authMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/add/user", authMiddleware, addAddress);
router.get("/user", authMiddleware, getAddress);
router.put("/update", authMiddleware, updateAddress);
router.delete("/delete", authMiddleware, deleteAddress);

module.exports = router;
