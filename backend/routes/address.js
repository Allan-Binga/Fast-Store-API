const express = require("express");
const {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address");
const { authUserMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/add/user", authUserMiddleware, addAddress);
router.get("/user", authUserMiddleware, getAddress);
router.put("/update", authUserMiddleware, updateAddress);
router.delete("/delete", authUserMiddleware, deleteAddress);

// Explicit IDs select the saved address to modify.
router.put("/:id", authUserMiddleware, updateAddress);
router.delete("/:id", authUserMiddleware, deleteAddress);
module.exports = router;
