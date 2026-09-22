const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Shared cookie settings ensure creation and deletion use the same scope.
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const issueTokens = (user, sessionId = crypto.randomUUID()) => ({
  sessionId,
  accessToken: jwt.sign({ id: String(user._id), role: user.role || "Customer", email: user.email, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: "1h", algorithm: "HS256" }),
  refreshToken: jwt.sign({ id: String(user._id), sid: sessionId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d", algorithm: "HS256", jwtid: crypto.randomUUID() }),
});
const setCookies = (res, tokens) => {
  res.cookie("accessToken", tokens.accessToken, { ...cookieOptions(), maxAge: 60 * 60 * 1000 });
  res.cookie("refreshToken", tokens.refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.clearCookie("storeSession", cookieOptions());
};
const clearCookies = (res) => { for (const name of ["accessToken", "refreshToken", "storeSession"]) res.clearCookie(name, cookieOptions()); };
module.exports = { cookieOptions, hashToken, issueTokens, setCookies, clearCookies };
