const Brand = require("../models/brand");
const {
  addBrand,
} = require("../controllers/brand");


const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});


beforeEach(() => {
  jest.restoreAllMocks();
});


test("brand creation stores the uploaded S3 logo URL", async () => {
  const create = jest
    .spyOn(Brand, "create")
    .mockImplementation(async (value) => value);
  const res = response();
  const next = jest.fn();

  await addBrand(
    {
      body: {
        name: "Acme",
        slogan: "Built to last",
      },
      file: {
        location:
          "https://fast-store.s3.example/brand-logos/acme.png",
      },
    },
    res,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create).toHaveBeenCalledWith({
    name: "Acme",
    slogan: "Built to last",
    logo:
      "https://fast-store.s3.example/brand-logos/acme.png",
  });
  expect(res.status).toHaveBeenCalledWith(201);
});


test("brand creation requires exactly one uploaded logo", async () => {
  const create = jest.spyOn(Brand, "create");
  const next = jest.fn();

  await addBrand(
    {
      body: {
        name: "Acme",
        slogan: "Built to last",
      },
    },
    response(),
    next,
  );

  expect(next.mock.calls[0][0].status).toBe(400);
  expect(create).not.toHaveBeenCalled();
});


test("brand creation rejects unexpected text fields", async () => {
  const create = jest.spyOn(Brand, "create");
  const next = jest.fn();

  await addBrand(
    {
      body: {
        name: "Acme",
        slogan: "Built to last",
        logo: "https://untrusted.example/logo.png",
      },
      file: {
        location:
          "https://fast-store.s3.example/brand-logos/acme.png",
      },
    },
    response(),
    next,
  );

  expect(next.mock.calls[0][0].status).toBe(400);
  expect(next.mock.calls[0][0].message).toContain("logo");
  expect(create).not.toHaveBeenCalled();
});
