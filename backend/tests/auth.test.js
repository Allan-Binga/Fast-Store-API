const { createUser, loginUser } = require("../controllers/auth");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

jest.mock("../models/users");
jest.mock("bcrypt");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests for createUser
  it("should return 409 if user already exists", async () => {
    User.findOne.mockResoledValue(true);

    req.body = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    await createUser(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toEqual({
      message: "User already exists with this email or phone!",
    });
  });

  it("should create a new user", async () => {
    User.findOne.mockResolvedValue(false);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.prototype.save.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      username: "testuser",
      email: "testuser@example.com",
      password: "hashedPassword",
    });

    req.body = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    await createUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toMatchObject({
      username: "testuser",
      email: "testuser@example.com",
    });
  });

  // Tests for loginUser
  it("should return 400 if username is incorrect", async () => {
    User.findOne.mockResolvedValue(null);

    req.body = {
      username: "wronguser",
      password: "password123",
    };

    await loginUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toBe("Wrong email or password.");
  });

  it("should return 400 if password is incorrect", async () => {
    User.findOne.mockResolvedValue({
      username: "testuser",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(false);

    req.body = {
      username: "testuser",
      password: "wrongpassword",
    };

    await loginUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toBe("Wrong password.");
  });

  it("should return 200 and set cookie if login is successful", async () => {
    User.findOne.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      username: "testuser",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(true);

    req.body = {
      username: "testuser",
      password: "password123",
    };

    await loginUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toBe("Login successful.");
    expect(res.cookies.storeSession).toBeDefined();
  });
});
