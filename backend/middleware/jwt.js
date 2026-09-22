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
  if (!user.isVerified) throw fail(403, "Please verify your email.");
  req.userId = String(user._id);
  req.user = user;
  next();
});

// Administrative access is based on the current stored role, not request data.
const authAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== "Admin") return next(fail(403, "Administrator access required."));
  next();
};
module.exports = { authUserMiddleware, authAdminMiddleware };
