const User = require("../models/users");

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { sendVerificationEmail } = require("./emailService");
const {
  asyncHandler,
  fail,
  emailValue,
  objectId,
  passwordValid,
} = require("../utils/http");
const {
  clearAdminCookies,
  hashToken,
  issueAdminTokens,
  setAdminCookies,
} = require("../utils/session");


const validateRegistrationKey = (req) => {
  const expectedKey = process.env.ADMIN_REGISTRATION_KEY;
  const suppliedKey = req.get("X-Admin-Registration-Key");

  if (!expectedKey) {
    throw fail(503, "Administrator registration is not configured.");
  }

  const expected = Buffer.from(expectedKey);
  const supplied = Buffer.from(
    typeof suppliedKey === "string" ? suppliedKey : ""
  );

  if (
    expected.length !== supplied.length ||
    !crypto.timingSafeEqual(expected, supplied)
  ) {
    throw fail(403, "Administrator registration is not authorized.");
  }
};


const validateAdminDetails = ({
  firstName,
  lastName,
  phone,
  password,
}) => {
  if (
    ![firstName, lastName, phone].every(
      (value) => typeof value === "string" && value.trim()
    )
  ) {
    throw fail(400, "Name and phone are required.");
  }

  if (!passwordValid(password)) {
    throw fail(
      400,
      "Use a strong password of at least 8 characters (maximum 72 bytes)."
    );
  }
};


// -----------------------------------------------------------------------------
// Register Administrator
// -----------------------------------------------------------------------------

// This endpoint is intended for controlled onboarding tools, not a public page.
// Rotate or remove ADMIN_REGISTRATION_KEY after onboarding is complete.
const registerAdmin = asyncHandler(async (req, res) => {
  validateRegistrationKey(req);

  const {
    firstName,
    lastName,
    phone,
    password,
  } = req.body;

  const email = emailValue(req.body.email);

  validateAdminDetails({
    firstName,
    lastName,
    phone,
    password,
  });

  const existingUser = await User.findOne({
    $or: [
      { email },
      { phone: phone.trim() },
    ],
  });

  if (existingUser) {
    throw fail(409, "An account already exists with that email or phone.");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const administrator = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email,
    phone: phone.trim(),
    password: await bcrypt.hash(password, 12),
    role: "Admin",
    isVerified: false,
    verificationToken: hashToken(verificationToken),
    verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch {
    return res.status(201).json({
      message:
        "Administrator account created, but the verification email could not be sent. Please resend verification.",
      verificationEmailSent: false,
      administrator: {
        id: administrator._id,
        email: administrator.email,
        role: administrator.role,
      },
    });
  }

  res.status(201).json({
    message: "Administrator account created. Please verify the email.",
    verificationEmailSent: true,
    administrator: {
      id: administrator._id,
      email: administrator.email,
      role: administrator.role,
    },
  });
});


// -----------------------------------------------------------------------------
// Login Administrator
// -----------------------------------------------------------------------------

const loginAdmin = asyncHandler(async (req, res) => {
  const email = emailValue(req.body.email);
  const { password } = req.body;

  if (
    typeof password !== "string" ||
    !password ||
    Buffer.byteLength(password) > 72
  ) {
    throw fail(
      400,
      "Password is required and must not exceed 72 bytes."
    );
  }

  const administrator = await User
    .findOne({
      email,
      role: "Admin",
    })
    .select("+password +adminSessionId");

  if (
    !administrator ||
    !await bcrypt.compare(password, administrator.password)
  ) {
    throw fail(401, "Invalid administrator credentials.");
  }

  if (!administrator.isVerified) {
    throw fail(
      403,
      "Please verify the administrator email before signing in."
    );
  }

  if (req.cookies?.adminAccessToken) {
    let existingSession;

    try {
      existingSession = jwt.verify(
        req.cookies.adminAccessToken,
        process.env.ADMIN_JWT_SECRET,
        {
          algorithms: ["HS256"],
        }
      );
    } catch {
      // An expired or malformed cookie can be replaced.
    }

    if (
      existingSession?.id === String(administrator._id) &&
      existingSession.sid === administrator.adminSessionId
    ) {
      throw fail(400, "This administrator is already signed in.");
    }
  }

  const tokens = issueAdminTokens(administrator);

  await User.updateOne(
    {
      _id: administrator._id,
      role: "Admin",
    },
    {
      $set: {
        adminSessionId: tokens.sessionId,
        adminRefreshTokenHash: hashToken(tokens.refreshToken),
      },
    }
  );

  setAdminCookies(res, tokens);

  res.status(200).json({
    message: "Administrator sign in successful.",
    administrator: {
      id: administrator._id,
      firstName: administrator.firstName,
      lastName: administrator.lastName,
      email: administrator.email,
      role: administrator.role,
    },
  });
});


// -----------------------------------------------------------------------------
// Refresh Administrator Session
// -----------------------------------------------------------------------------

const refreshAdminSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.adminRefreshToken;

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_REFRESH_SECRET,
      {
        algorithms: ["HS256"],
      }
    );
  } catch {
    clearAdminCookies(res);
    throw fail(401, "Invalid or expired administrator refresh token.");
  }

  if (
    !objectId(decoded.id) ||
    decoded.role !== "Admin" ||
    typeof decoded.sid !== "string"
  ) {
    clearAdminCookies(res);
    throw fail(401, "Invalid administrator session.");
  }

  const filter = {
    _id: decoded.id,
    role: "Admin",
    adminSessionId: decoded.sid,
    adminRefreshTokenHash: hashToken(token),
    isVerified: true,
  };

  const administrator = await User.findOne(filter);

  if (!administrator) {
    clearAdminCookies(res);
    throw fail(401, "Administrator session has ended.");
  }

  const tokens = issueAdminTokens(
    administrator,
    decoded.sid
  );

  const result = await User.updateOne(
    filter,
    {
      $set: {
        adminRefreshTokenHash: hashToken(tokens.refreshToken),
      },
    }
  );

  if (result.modifiedCount !== 1) {
    throw fail(401, "Administrator refresh token was already used.");
  }

  setAdminCookies(res, tokens);

  res.json({
    message: "Administrator session refreshed.",
  });
});


// -----------------------------------------------------------------------------
// Logout Administrator
// -----------------------------------------------------------------------------

const logoutAdmin = asyncHandler(async (req, res) => {
  const cookies = [
    [
      "adminRefreshToken",
      process.env.ADMIN_JWT_REFRESH_SECRET,
    ],
    [
      "adminAccessToken",
      process.env.ADMIN_JWT_SECRET,
    ],
  ];

  for (const [cookieName, secret] of cookies) {
    let decoded;

    try {
      decoded = jwt.verify(
        req.cookies?.[cookieName],
        secret,
        {
          algorithms: ["HS256"],
        }
      );
    } catch {
      continue;
    }

    if (
      objectId(decoded.id) &&
      typeof decoded.sid === "string"
    ) {
      await User.updateOne(
        {
          _id: decoded.id,
          role: "Admin",
          adminSessionId: decoded.sid,
        },
        {
          $unset: {
            adminSessionId: 1,
            adminRefreshTokenHash: 1,
          },
        }
      );
    }
  }

  clearAdminCookies(res);

  res.json({
    message: "Administrator logout successful.",
  });
});


const checkAdminSession = (req, res) => {
  res.json({
    isLoggedIn: true,
    administrator: {
      id: req.userId,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
    },
  });
};


module.exports = {
  registerAdmin,
  loginAdmin,
  refreshAdminSession,
  logoutAdmin,
  checkAdminSession,
};
