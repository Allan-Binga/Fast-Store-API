const User = require("../models/users");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { notifyUser } = require("../services/notifications");
const { sendVerificationEmail } = require("./emailService");

const {
    asyncHandler,
    fail,
    emailValue,
    passwordValid,
    objectId,
} = require("../utils/http");

const {
    hashToken,
    issueTokens,
    setCookies,
    clearCookies,
} = require("../utils/session");



// Register User


// Create customer accounts;
// callers cannot assign roles or verification status.
const registerUser = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        phone,
        password,
    } = req.body;

    const email = emailValue(req.body.email);


    // Validate name and phone.
    if (
        ![firstName, lastName, phone].every(
            (value) => typeof value === "string" && value.trim()
        )
    ) {
        throw fail(
            400,
            "Name and phone are required."
        );
    }


    // Validate password.
    if (!passwordValid(password)) {
        throw fail(
            400,
            "Use a strong password of at least 8 characters (maximum 72 bytes)."
        );
    }


    // Prevent duplicate accounts.
    const existingUser = await User.findOne({
        $or: [
            { email },
            { phone: phone.trim() },
        ],
    });

    if (existingUser) {
        throw fail(
            409,
            "Account already exists. Sign in or resend verification."
        );
    }


    // Generate email verification token.
    const token = crypto
        .randomBytes(32)
        .toString("hex");


    // Create user.
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        phone: phone.trim(),
        password: await bcrypt.hash(password, 12),
        verificationToken: hashToken(token),
        verificationTokenExpiry: new Date(
            Date.now() + 30 * 60 * 1000
        ),
    });


    // Create signup notification.
    await notifyUser(
        newUser._id,
        "Thank you for registering.",
        "signup"
    );


    // Send verification email.
    try {
        await sendVerificationEmail(email, token);
    } catch {
        return res.status(201).json({
            message:
                "Account created, but verification email could not be sent. Please resend verification.",
            verificationEmailSent: false,
        });
    }


    res.status(201).json({
        message: "Account created. Please verify your email.",
        verificationEmailSent: true,
    });
});



// Login User


// Issue a one-hour access token and a seven-day,
// database-backed refresh token.
const loginUser = asyncHandler(async (req, res) => {
    const email = emailValue(req.body.email);
    const { password } = req.body;


    // Validate password input.
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


    // Find user and explicitly retrieve protected authentication fields.
    const user = await User
        .findOne({
            email,
            role: "Customer",
        })
        .select("+password +sessionId");


    // Validate credentials.
    if (
        !user ||
        !await bcrypt.compare(password, user.password)
    ) {
        throw fail(
            401,
            "Invalid credentials. Please try again."
        );
    }


    // Prevent unverified users from signing in.
    if (!user.isVerified) {
        throw fail(
            403,
            "Please verify your email before signing in."
        );
    }


    // Ignore expired cookies, but do not replace
    // an already valid session accidentally.
    if (req.cookies?.accessToken) {
        let existing;

        try {
            existing = jwt.verify(
                req.cookies.accessToken,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"],
                }
            );
        } catch {
            // An expired cookie is safe to replace.
        }

        if (
            existing?.id === String(user._id) &&
            existing.sid === user.sessionId
        ) {
            throw fail(
                400,
                "You are already logged in."
            );
        }
    }


    // Generate access and refresh tokens.
    const tokens = issueTokens(user);


    // Store the new session and hashed refresh token.
    await User.updateOne(
        {
            _id: user._id,
        },
        {
            $set: {
                sessionId: tokens.sessionId,
                refreshTokenHash: hashToken(tokens.refreshToken),
            },
        }
    );


    // Set authentication cookies.
    setCookies(res, tokens);


    // Create login notification.
    await notifyUser(
        user._id,
        "You have successfully logged in.",
        "login"
    );


    res.status(200).json({
        message: "Sign in successful",
        user: {
            id: user._id,
            email: user.email,
            role: user.role || "Customer",
        },
    });
});



// Refresh Session


// Rotate refresh tokens atomically
// so a token cannot be redeemed twice.
const refreshSession = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    let decoded;


    // Verify refresh token.
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET,
            {
                algorithms: ["HS256"],
            }
        );
    } catch {
        clearCookies(res);

        throw fail(
            401,
            "Invalid or expired refresh token."
        );
    }


    // Validate token payload.
    if (
        !objectId(decoded.id) ||
        typeof decoded.sid !== "string"
    ) {
        throw fail(
            401,
            "Invalid session."
        );
    }


    // Match the refresh token against the stored session.
    const filter = {
        _id: decoded.id,
        sessionId: decoded.sid,
        refreshTokenHash: hashToken(token),
        isVerified: true,
        role: "Customer",
    };

    const user = await User.findOne(filter);


    // Session no longer exists.
    if (!user) {
        clearCookies(res);

        throw fail(
            401,
            "Session has ended."
        );
    }


    // Generate a new token pair while retaining the session ID.
    const tokens = issueTokens(
        user,
        decoded.sid
    );


    // Atomically replace the stored refresh token.
    const result = await User.updateOne(
        filter,
        {
            $set: {
                refreshTokenHash: hashToken(tokens.refreshToken),
            },
        }
    );


    // Prevent refresh token reuse.
    if (result.modifiedCount !== 1) {
        throw fail(
            401,
            "Refresh token already used."
        );
    }


    // Set the rotated authentication cookies.
    setCookies(res, tokens);

    res.json({
        message: "Session refreshed.",
    });
});



// Logout User


// Revocation affects access tokens as well as refresh tokens
// through sessionId.
const logoutUser = asyncHandler(async (req, res) => {
    const cookies = [
        [
            "refreshToken",
            process.env.JWT_REFRESH_SECRET,
        ],
        [
            "accessToken",
            process.env.JWT_SECRET,
        ],
    ];


    for (const [cookie, secret] of cookies) {
        let decoded;

        try {
            decoded = jwt.verify(
                req.cookies?.[cookie],
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
                    sessionId: decoded.sid,
                },
                {
                    $unset: {
                        sessionId: 1,
                        refreshTokenHash: 1,
                    },
                }
            );
        }
    }


    // Remove authentication cookies.
    clearCookies(res);

    res.json({
        message: "Logout successful.",
    });
});



// Check Login


const checkLogin = (req, res) => {
    res.json({
        isLoggedIn: true,
        userId: req.userId,
        user: {
            id: req.userId,
            email: req.user.email,
            role: req.user.role || "Customer",
        },
    });
};



// Exports


module.exports = {
    registerUser,
    loginUser,
    refreshSession,
    logoutUser,
    checkLogin,
};
