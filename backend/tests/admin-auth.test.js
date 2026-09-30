process.env.ADMIN_JWT_SECRET =
  "admin-access-test-secret-that-is-not-for-production";
process.env.ADMIN_JWT_REFRESH_SECRET =
  "admin-refresh-test-secret-that-is-not-for-production";
process.env.ADMIN_REGISTRATION_KEY =
  "admin-registration-test-key-that-is-not-for-production";

jest.mock("../controllers/emailService", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../services/notifications", () => ({
  notifyUser: jest.fn().mockResolvedValue(undefined),
}));

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const adminAuth = require("../controllers/adminAuth");
const {
  hashToken,
  issueAdminTokens,
} = require("../utils/session");


const id = "507f1f77bcf86cd799439011";

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
});


let administrator;

beforeEach(async () => {
  jest.restoreAllMocks();

  administrator = {
    _id: id,
    firstName: "Store",
    lastName: "Admin",
    email: "admin@example.com",
    phone: "+254700000000",
    password: await bcrypt.hash("StrongPass1!", 4),
    isVerified: true,
    role: "Admin",
    adminSessionId: "admin-session-a",
  };
});


test("administrator registration rejects a missing private key", async () => {
  const create = jest.spyOn(User, "create");
  const next = jest.fn();

  await adminAuth.registerAdmin(
    {
      get: jest.fn(),
      body: {
        firstName: "Store",
        lastName: "Admin",
        email: "admin@example.com",
        phone: "+254700000000",
        password: "StrongPass1!",
      },
    },
    response(),
    next,
  );

  expect(next.mock.calls[0][0].status).toBe(403);
  expect(create).not.toHaveBeenCalled();
});


test("administrator registration creates only an Admin account", async () => {
  jest.spyOn(User, "findOne").mockResolvedValue(null);
  const create = jest.spyOn(User, "create").mockImplementation(
    async (details) => ({
      _id: id,
      ...details,
    }),
  );
  const res = response();
  const next = jest.fn();

  await adminAuth.registerAdmin(
    {
      get: jest.fn().mockReturnValue(
        process.env.ADMIN_REGISTRATION_KEY,
      ),
      body: {
        firstName: "Store",
        lastName: "Admin",
        email: "admin@example.com",
        phone: "+254700000000",
        password: "StrongPass1!",
      },
    },
    res,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0]).toMatchObject({
    email: "admin@example.com",
    role: "Admin",
    isVerified: false,
  });
  expect(res.status).toHaveBeenCalledWith(201);
});


test("administrator login uses separate cookies and session fields", async () => {
  jest.spyOn(User, "findOne").mockReturnValue({
    select: () => Promise.resolve(administrator),
  });
  const update = jest
    .spyOn(User, "updateOne")
    .mockResolvedValue({ modifiedCount: 1 });
  const res = response();
  const next = jest.fn();

  await adminAuth.loginAdmin(
    {
      body: {
        email: administrator.email,
        password: "StrongPass1!",
      },
      cookies: {},
    },
    res,
    next,
  );

  expect(next).not.toHaveBeenCalled();

  const accessCookie = res.cookie.mock.calls.find(
    ([name]) => name === "adminAccessToken"
  );
  const refreshCookie = res.cookie.mock.calls.find(
    ([name]) => name === "adminRefreshToken"
  );

  expect(
    jwt.verify(
      accessCookie[1],
      process.env.ADMIN_JWT_SECRET,
    ).role
  ).toBe("Admin");
  expect(
    jwt.verify(
      refreshCookie[1],
      process.env.ADMIN_JWT_REFRESH_SECRET,
    ).role
  ).toBe("Admin");

  expect(update.mock.calls[0][1].$set).toMatchObject({
    adminRefreshTokenHash: hashToken(refreshCookie[1]),
  });

  expect(res.cookie.mock.calls.map(([name]) => name)).not.toContain(
    "accessToken"
  );
});


test("administrator refresh rotates against the admin token hash", async () => {
  const tokens = issueAdminTokens(
    administrator,
    administrator.adminSessionId,
  );

  jest.spyOn(User, "findOne").mockResolvedValue(administrator);
  const update = jest
    .spyOn(User, "updateOne")
    .mockResolvedValue({ modifiedCount: 1 });
  const res = response();
  const next = jest.fn();

  await adminAuth.refreshAdminSession(
    {
      cookies: {
        adminRefreshToken: tokens.refreshToken,
      },
    },
    res,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(update.mock.calls[0][0]).toMatchObject({
    role: "Admin",
    adminSessionId: administrator.adminSessionId,
    adminRefreshTokenHash: hashToken(tokens.refreshToken),
  });

  const rotatedRefresh = res.cookie.mock.calls.find(
    ([name]) => name === "adminRefreshToken"
  )[1];

  expect(rotatedRefresh).not.toBe(tokens.refreshToken);
});


test("administrator logout leaves customer cookie names untouched", async () => {
  const tokens = issueAdminTokens(
    administrator,
    administrator.adminSessionId,
  );

  jest
    .spyOn(User, "updateOne")
    .mockResolvedValue({ modifiedCount: 1 });

  const res = response();

  await adminAuth.logoutAdmin(
    {
      cookies: {
        adminAccessToken: tokens.accessToken,
      },
    },
    res,
    jest.fn(),
  );

  const clearedCookies = res.clearCookie.mock.calls.map(
    ([name]) => name
  );

  expect(clearedCookies).toEqual(
    expect.arrayContaining([
      "adminAccessToken",
      "adminRefreshToken",
    ])
  );
  expect(clearedCookies).not.toContain("accessToken");
  expect(clearedCookies).not.toContain("refreshToken");
});
