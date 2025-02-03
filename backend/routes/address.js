const express = require("express");
const {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address");

const router = express.Router();

router.post("/add/user", addAddress);
router.get("/user", getAddress);
router.put("/update", updateAddress);
router.delete("/delete", deleteAddress);

module.exports = router;
