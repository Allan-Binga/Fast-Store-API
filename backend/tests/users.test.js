const {
  getUsers,
  getSingleUser,
  updatedUser,
  deleteUser,
} = require("../controllers/users");
const httpMocks = require("node-mocks-http");
const User = require("../models/users");

//MOCK FUNCTION
jest.mock("../models/users");
describe("Users test controller.", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });
  //TESTING FOR GETTING ALL USERS.
  it("should return all users", async () => {
    const mockUsers = [
      {
        _id: "5627926572",
        username: "John Binga",
        email: "john@gmail.com",
        password: "12345",
      },
      {
        _id: "6738037683",
        username: "Allan Binga",
        email: "allan@gmail.com",
        password: "67890",
      },
    ];

    // Mock the Mongoose `find` method
    User.find.mockResolvedValue(mockUsers);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/users",
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getUsers(req, res, next);

    expect(User.find).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockUsers);
    expect(next).not.toHaveBeenCalled();
  });

  //TESTING FOR AN ERROR WHEN NO USER IS FOUND
  it("should return 404 if no users are found", async () => {
    // Mock the Mongoose `find` method to return an empty array
    User.find.mockResolvedValue([]);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/users",
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getUsers(req, res, next);

    expect(User.find).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404); // Expect 404 for no users found
    expect(res._getJSONData()).toEqual({
      message: "No users found.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  //TESTING FOR GETTING A SINGLE USER
  it("should return a single user", async () => {
    const mockUser = {
      _id: "5627926572",
      username: "John Binga",
      email: "john@gmail.com",
      password: "12345",
    };

    // Mock the Mongoose `findById` method
    User.findById.mockResolvedValue(mockUser);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/users/5627926572",
      params: {
        id: "5627926572",
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getSingleUser(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("5627926572");
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockUser);
    expect(next).not.toHaveBeenCalled();
  });

  //TESTING FOR AN ERROR THE SINGLE USER IS NOT FOUND
  it("should return 404 if user is not found", async () => {
    //MOCK MONGOOSE'S 'findById'
    User.findById.mockResolvedValue(null);

    const req = httpMocks.createRequest({
      method: "GET",
      url: "/users/9999999999",
      params: {
        id: "9999999999",
      },
    });

    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getSingleUser(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("9999999999");
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "User not found" });
    expect(next).not.toHaveBeenCalled();
  });

  //TESTING FOR UPDATING A USER
  it("should update a user successfully", async () => {
    // Mock the request and response objects
    const req = httpMocks.createRequest({
      method: "PUT",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "123", name: "Binga" },
    });
    const res = httpMocks.createResponse();

    // Mock the `findByIdAndUpdate` method to return an updated user
    User.findByIdAndUpdate.mockResolvedValue({
      _id: "123",
      name: "Binga",
    });

    await updatedUser(req, res);

    // Validate the response
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      _id: "123",
      name: "Binga",
    });
  });

  //TESTING FOR WHEN A USER TRIES TO UPDATE ANOTHER USERS ACCOUNT
  it("should return 401 if the user tries updating another users account", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "456", name: "Binga" },
    });

    const res = httpMocks.createResponse();

    // Mock the `findByIdAndUpdate` method to return an updated user
    User.findByIdAndUpdate.mockResolvedValue({
      _id: "123",
      name: "Binga",
    });

    await updatedUser(req, res);

    // Validate the response
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toBe(
      "You can only update your account."
    );
  });

  //TESTING FOR WHEN A USER DELETES THEIR ACCOUNT
  it("should return 200 if user deletes their account", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "123" }, // User is deleting their own account
    });
    const res = httpMocks.createResponse();

    // Mock the `findById` and `findByIdAndDelete` methods to simulate a successful deletion
    User.findById.mockResolvedValue({ _id: "123" });
    User.findByIdAndDelete.mockResolvedValue(true);

    await deleteUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual("User has been deleted.");
  });

  //TESTING WHEN A USER TRIES TO DELETE SOMEONE ELSE'S ACCOUNT
  it("should return error 401 when a user tries to delete another users account", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "456" }, // User is trying to delete someone else's account
    });
    const res = httpMocks.createResponse();

    await deleteUser(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual("You can only delete your account.");
  });

  //TESTING WHEN A USER TRIES TO DELETE AN UNKNOWN USER
  it("should return error 404 when a user tries to delete an unknown user", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "123" }, // User is deleting their own account
    });
    const res = httpMocks.createResponse();

    // Mock the `findById` method to simulate user not found
    User.findById.mockResolvedValue(null);

    await deleteUser(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual("User not found.");
  });

  //TESTING WHEN A USER ENCOUNTERS A PROBLEM DELETING A USER
  it("should return 500 if there's an error deleting the user", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      url: "/users/:id",
      params: { id: "123" },
      body: { userId: "123" },  // User is deleting their own account
    });
    const res = httpMocks.createResponse();

    // Mock the `findById` and `findByIdAndDelete` methods to simulate a deletion failure
    User.findById.mockResolvedValue({ _id: "123" });
    User.findByIdAndDelete.mockRejectedValue(new Error("Database error"));

    await deleteUser(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual("Error occured while deleting user.");
  });
});
