const express = require("express");

const {
  registerAdmin,
  loginAdmin,
  refreshAdminSession,
  logoutAdmin,
  checkAdminSession,
} = require("../controllers/adminAuth");
const { authAdminMiddleware } = require("../middleware/jwt");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/refresh", refreshAdminSession);
router.post("/logout", logoutAdmin);
router.get("/check-session", authAdminMiddleware, checkAdminSession);

module.exports = router;
