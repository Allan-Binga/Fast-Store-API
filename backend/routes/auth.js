const { authUserMiddleware } = require("../middleware/jwt");
const express = require("express");

const {
  loginUser,
  logoutUser,
  registerUser,
  checkLogin,
  refreshSession,
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-session", authUserMiddleware, checkLogin);
// Exchange a valid refresh cookie for a new token pair.
router.post("/refresh", refreshSession);

module.exports = router;
