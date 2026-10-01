const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const deployedOverHttps = () =>
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.COOKIE_SECURE === "true";

// Creation and deletion must use the same cookie scope and partition policy.
const cookieOptions = () => {
  const secure = deployedOverHttps();

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
};

// The admin UI and Render API are currently cross-site. Partitioning keeps the
// cookie usable from that one top-level admin site when third-party cookies are
// restricted, without making the session available to unrelated sites.
const adminCookieOptions = () => {
  const options = cookieOptions();

  return {
    ...options,
    ...(options.secure ? { partitioned: true, priority: "high" } : {}),
  };
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const issueTokens = (user, sessionId = crypto.randomUUID()) => {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    sessionId,
    accessToken: jwt.sign(
      {
        id: String(user._id),
        role: user.role || "Customer",
        email: user.email,
        sid: sessionId,
        iat: issuedAt,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" },
    ),
    refreshToken: jwt.sign(
      { id: String(user._id), sid: sessionId, iat: issuedAt },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", algorithm: "HS256", jwtid: crypto.randomUUID() },
    ),
  };
};

const issueAdminTokens = (user, sessionId = crypto.randomUUID()) => {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    sessionId,
    accessToken: jwt.sign(
      {
        id: String(user._id),
        role: "Admin",
        email: user.email,
        sid: sessionId,
        iat: issuedAt,
      },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" },
    ),
    refreshToken: jwt.sign(
      { id: String(user._id), role: "Admin", sid: sessionId, iat: issuedAt },
      process.env.ADMIN_JWT_REFRESH_SECRET,
      { expiresIn: "7d", algorithm: "HS256", jwtid: crypto.randomUUID() },
    ),
  };
};

const setCookies = (res, tokens) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions(),
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.clearCookie("storeSession", cookieOptions());
};

const clearCookies = (res) => {
  for (const name of ["accessToken", "refreshToken", "storeSession"]) {
    res.clearCookie(name, cookieOptions());
  }
};

const setAdminCookies = (res, tokens) => {
  res.cookie("adminAccessToken", tokens.accessToken, {
    ...adminCookieOptions(),
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("adminRefreshToken", tokens.refreshToken, {
    ...adminCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAdminCookies = (res) => {
  for (const name of ["adminAccessToken", "adminRefreshToken"]) {
    res.clearCookie(name, adminCookieOptions());
  }
};

module.exports = {
  cookieOptions,
  adminCookieOptions,
  hashToken,
  issueTokens,
  setCookies,
  clearCookies,
  issueAdminTokens,
  setAdminCookies,
  clearAdminCookies,
};
