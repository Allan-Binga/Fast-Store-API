process.env.JWT_SECRET = "access-test-secret-that-is-not-for-production";
process.env.JWT_REFRESH_SECRET = "refresh-test-secret-that-is-not-for-production";
jest.mock("../services/notifications", () => ({ notifyUser: jest.fn().mockResolvedValue(undefined) }));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const { issueTokens, hashToken } = require("../utils/session");
const auth = require("../controllers/auth");
const password = require("../controllers/password");
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const users = require("../controllers/users");
jest.mock("../controllers/emailService", () => ({ sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() }));

// Isolate database access and cookies while exercising real signed JWTs.
const id = "507f1f77bcf86cd799439011";
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), clearCookie: jest.fn().mockReturnThis() });
let user;
beforeEach(async () => {
  jest.restoreAllMocks();
  user = { _id: id, email: "shopper@example.com", password: await bcrypt.hash("StrongPass1!", 4), isVerified: true, role: "Customer", sessionId: "session-a" };
});

test("login creates distinct access and refresh tokens and stores only the refresh hash", async () => {
  jest.spyOn(User, "findOne").mockReturnValue({ select: () => Promise.resolve(user) });
  const update = jest.spyOn(User, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  const res = response(), next = jest.fn();
  await auth.loginUser({ body: { email: user.email, password: "StrongPass1!" }, cookies: {} }, res, next);
  expect(next).not.toHaveBeenCalled();
  const access = res.cookie.mock.calls.find(c => c[0] === "accessToken");
  const refresh = res.cookie.mock.calls.find(c => c[0] === "refreshToken");
  const decoded = jwt.verify(access[1], process.env.JWT_SECRET);
  expect(decoded.role).toBe("Customer");
  expect(decoded.exp - decoded.iat).toBe(3600);
  expect(jwt.verify(refresh[1], process.env.JWT_REFRESH_SECRET).exp - decoded.iat).toBe(604800);
  expect(update.mock.calls[0][1].$set.refreshTokenHash).toBe(hashToken(refresh[1]));
  expect(access[2]).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
});

test("invalid credentials return 401 without cookies", async () => {
  jest.spyOn(User, "findOne").mockReturnValue({ select: () => Promise.resolve(user) });
  const res = response(), next = jest.fn();
  await auth.loginUser({ body: { email: user.email, password: "wrong" }, cookies: {} }, res, next);
  expect(next.mock.calls[0][0].status).toBe(401);
  expect(res.cookie).not.toHaveBeenCalled();
});

test("unverified accounts cannot log in", async () => {
  jest.spyOn(User, "findOne").mockReturnValue({ select: () => Promise.resolve({ ...user, isVerified: false }) });
  const next = jest.fn();
  await auth.loginUser({ body: { email: user.email, password: "StrongPass1!" }, cookies: {} }, response(), next);
  expect(next.mock.calls[0][0].status).toBe(403);
});

test("an expired or malformed access cookie does not block a fresh login", async () => {
  jest.spyOn(User, "findOne").mockReturnValue({ select: () => Promise.resolve(user) });
  jest.spyOn(User, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  const res = response(), next = jest.fn();
  await auth.loginUser({ body: { email: user.email, password: "StrongPass1!" }, cookies: { accessToken: "expired" } }, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
});

test("refresh rotates atomically against the previous token hash", async () => {
  const tokens = issueTokens(user, user.sessionId);
  jest.spyOn(User, "findOne").mockResolvedValue(user);
  const update = jest.spyOn(User, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  const res = response();
  await auth.refreshSession({ cookies: { refreshToken: tokens.refreshToken } }, res, jest.fn());
  expect(update.mock.calls[0][0]).toMatchObject({ refreshTokenHash: hashToken(tokens.refreshToken), sessionId: user.sessionId });
  expect(res.cookie.mock.calls.find(c => c[0] === "refreshToken")[1]).not.toBe(tokens.refreshToken);
});

test("a concurrently consumed refresh token cannot issue cookies", async () => {
  jest.spyOn(User, "findOne").mockResolvedValue(user);
  jest.spyOn(User, "updateOne").mockResolvedValue({ modifiedCount: 0 });
  const res = response(), next = jest.fn();
  await auth.refreshSession({ cookies: { refreshToken: issueTokens(user, user.sessionId).refreshToken } }, res, next);
  expect(next.mock.calls[0][0].status).toBe(401);
  expect(res.cookie).not.toHaveBeenCalled();
});

test("middleware rejects a revoked session even with a valid access JWT", async () => {
  jest.spyOn(User, "findById").mockReturnValue({ select: () => Promise.resolve({ ...user, sessionId: "replacement" }) });
  const next = jest.fn();
  await authUserMiddleware({ cookies: { accessToken: issueTokens(user, user.sessionId).accessToken } }, response(), next);
  expect(next.mock.calls[0][0].status).toBe(401);
});

test("middleware loads the database role and accepts the active session", async () => {
  jest.spyOn(User, "findById").mockReturnValue({ select: () => Promise.resolve(user) });
  const req = { cookies: { accessToken: issueTokens(user, user.sessionId).accessToken } }, next = jest.fn();
  await authUserMiddleware(req, response(), next);
  expect(req.userId).toBe(id);
  expect(req.user.role).toBe("Customer");
  expect(next).toHaveBeenCalledWith();
});

test("customers cannot access administrator actions", () => {
  const next = jest.fn();
  authAdminMiddleware({ user }, response(), next);
  expect(next.mock.calls[0][0].status).toBe(403);
});

test("profile editing rejects another owner and privileged fields", async () => {
  for (const req of [ { userId: "other", params: { id }, body: { firstName: "Name" } }, { userId: id, params: { id }, body: { role: "Admin" } } ]) {
    const next = jest.fn();
    await users.updatedUser(req, response(), next);
    expect([400, 403]).toContain(next.mock.calls[0][0].status);
  }
});

test("logout revokes the matching database session and clears both cookies", async () => {
  const update = jest.spyOn(User, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  const res = response();
  await auth.logoutUser({ cookies: { accessToken: issueTokens(user, user.sessionId).accessToken } }, res, jest.fn());
  expect(update).toHaveBeenCalledWith({ _id: id, sessionId: user.sessionId }, { $unset: { sessionId: 1, refreshTokenHash: 1 } });
  expect(res.clearCookie.mock.calls.map(c => c[0])).toEqual(expect.arrayContaining(["accessToken", "refreshToken"]));
});

test("token password reset consumes the token and revokes sessions atomically", async () => {
  const update = jest.spyOn(User, "findOneAndUpdate").mockResolvedValue(user);
  const res = response(), next = jest.fn();
  await password.resetPasswordToken({ body: { token: "a".repeat(64), newPassword: "NewPassword1!", confirmPassword: "NewPassword1!" } }, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(update.mock.calls[0][1].$unset).toMatchObject({ passwordResetToken: 1, sessionId: 1, refreshTokenHash: 1 });
});

test("user serialization strips all authentication secrets", () => {
  const document = new User({ ...user, refreshTokenHash: "hash", verificationToken: "token", passwordResetToken: "reset" });
  const serialized = document.toJSON();
  for (const field of ["password", "sessionId", "refreshTokenHash", "verificationToken", "passwordResetToken"]) expect(serialized[field]).toBeUndefined();
});
