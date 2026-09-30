const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { asyncHandler, fail, objectId } = require("../utils/http");

// Validate both JWT integrity and the current database session.
const authUserMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) throw fail(401, "Please log in.");
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }); }
  catch { throw fail(401, "Invalid or expired access token."); }
  if (!objectId(decoded.id) || typeof decoded.sid !== "string") throw fail(401, "Invalid session.");
  const user = await User.findById(decoded.id).select("+sessionId");
  if (!user || !user.sessionId || user.sessionId !== decoded.sid) throw fail(401, "Session has ended. Please log in again.");
  if (user.role !== "Customer") throw fail(403, "Use the administrator sign-in page.");
  if (!user.isVerified) throw fail(403, "Please verify your email.");
  req.userId = String(user._id);
  req.user = user;
  next();
});

// Administrator routes accept only the separate administrator session.
const authAdminMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.adminAccessToken;
  if (!token) throw fail(401, "Administrator sign-in required.");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    throw fail(401, "Invalid or expired administrator access token.");
  }

  if (
    !objectId(decoded.id) ||
    decoded.role !== "Admin" ||
    typeof decoded.sid !== "string"
  ) {
    throw fail(401, "Invalid administrator session.");
  }

  const user = await User.findById(decoded.id).select("+adminSessionId");
  if (
    !user ||
    user.role !== "Admin" ||
    !user.adminSessionId ||
    user.adminSessionId !== decoded.sid
  ) {
    throw fail(401, "Administrator session has ended. Please sign in again.");
  }

  if (!user.isVerified) throw fail(403, "Please verify your email.");

  req.userId = String(user._id);
  req.user = user;
  next();
});
module.exports = { authUserMiddleware, authAdminMiddleware };
