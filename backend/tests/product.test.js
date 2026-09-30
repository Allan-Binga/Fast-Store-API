const Product = require("../models/product");
const InventoryMovement = require("../models/inventoryMovement");
const controller = require("../controllers/product");
const {
  getCategoryProducts,
} = require("../controllers/category");

const id = "507f1f77bcf86cd799439011";

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(InventoryMovement, "create").mockResolvedValue([]);
});


test("multipart fields and dotted reviews create a product", async () => {
  jest.spyOn(Product, "findOne").mockResolvedValue(null);

  const create = jest
    .spyOn(Product, "create")
    .mockImplementation(async (value) => value);

  const next = jest.fn();
  const response = res();

  await controller.addNewProduct(
    {
      body: {
        name: "Free",
        currentPrice: "0",
        originalPrice: "0",
        costPrice: "0",
        quantity: "0",
        category: "Home",
        description: "Description",
        "reviews.rate": "0",
        "reviews.count": "0",
        newArrival: "false",
      },
      files: [
        {
          location: "https://bucket.example/products/free.webp",
        },
      ],
    },
    response,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0]).toMatchObject({
    currentPrice: 0,
    originalPrice: 0,
    costPrice: 0,
    quantity: 0,
    category: ["Home"],
    images: [
      "https://bucket.example/products/free.webp",
    ],
    reviews: {
      rate: 0,
      count: 0,
    },
    newArrival: false,
    discount: 0,
  });
  expect(response.status).toHaveBeenCalledWith(201);
});


test("reviews can be supplied as JSON in multipart form-data", async () => {
  jest.spyOn(Product, "findOne").mockResolvedValue(null);

  const create = jest
    .spyOn(Product, "create")
    .mockImplementation(async (value) => value);

  const next = jest.fn();

  await controller.addNewProduct(
    {
      body: {
        name: "Headphones",
        currentPrice: "100",
        originalPrice: "120",
        costPrice: "60",
        quantity: "5",
        category: '["Electronics", "Audio"]',
        description: "Description",
        reviews: '{"rate":4.5,"count":12}',
      },
      files: [
        {
          location: "https://bucket.example/products/headphones.jpg",
        },
      ],
    },
    res(),
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0]).toMatchObject({
    category: ["Electronics", "Audio"],
    reviews: {
      rate: 4.5,
      count: 12,
    },
  });
});


test("product updates retain images and recalculate discounts", async () => {
  const product = {
    name: "Old",
    currentPrice: 20,
    originalPrice: 40,
    costPrice: 12,
    quantity: 5,
    category: ["Home"],
    description: "Description",
    images: ["https://bucket.example/products/old.jpg"],
    reviews: {
      rate: 4,
      count: 2,
    },
    newArrival: true,
    save: jest.fn(),
  };

  jest.spyOn(Product, "findById").mockReturnValue({
    select: async () => product,
  });

  await controller.updateProduct(
    {
      params: {
        id,
      },
      body: {
        name: "New",
        currentPrice: "10",
      },
      files: [],
    },
    res(),
    jest.fn(),
  );

  expect(product.name).toBe("New");
  expect(product.currentPrice).toBe(10);
  expect(product.discount).toBe(75);
  expect(product.images).toEqual([
    "https://bucket.example/products/old.jpg",
  ]);
  expect(product.save).toHaveBeenCalled();
});


test("the primary image virtual preserves storefront compatibility", () => {
  const product = new Product({
    name: "Camera",
    currentPrice: 50,
    originalPrice: 60,
    quantity: 1,
    category: ["Electronics"],
    description: "Description",
    images: [
      "https://bucket.example/products/primary.jpg",
      "https://bucket.example/products/secondary.jpg",
    ],
    reviews: {
      rate: 4,
      count: 3,
    },
  });

  expect(product.image).toBe(
    "https://bucket.example/products/primary.jpg"
  );
  expect(product.toJSON().image).toBe(
    "https://bucket.example/products/primary.jpg"
  );
});


test("legacy single-image products hydrate into the image gallery", () => {
  const product = Product.hydrate({
    _id: id,
    name: "Legacy",
    currentPrice: 10,
    originalPrice: 10,
    quantity: 1,
    category: ["Home"],
    description: "Description",
    image: "https://bucket.example/products/legacy.jpg",
    reviews: {
      rate: 0,
      count: 0,
    },
  });

  expect(product.images).toEqual([
    "https://bucket.example/products/legacy.jpg",
  ]);
  expect(product.image).toBe(
    "https://bucket.example/products/legacy.jpg"
  );
});


test("invalid product IDs produce a client error", async () => {
  const next = jest.fn();

  await controller.getSingleProduct(
    {
      params: {
        id: "bad",
      },
    },
    res(),
    next,
  );

  expect(next.mock.calls[0][0].status).toBe(400);
});


test("category names are escaped as literal text", async () => {
  const find = jest.spyOn(Product, "find").mockReturnValue({
    sort: () => ({
      skip: () => ({
        limit: async () => [],
      }),
    }),
  });

  await getCategoryProducts(
    {
      params: {
        category: "Home (A+B)",
      },
      query: {},
    },
    res(),
    jest.fn(),
  );

  const regex = find.mock.calls[0][0].category;

  expect(regex.test("Home (A+B)")).toBe(true);
  expect(regex.test("Home AAAB")).toBe(false);
});


test("search index is declared on the catalog schema", () => {
  expect(
    Product.schema.indexes().some(
      ([keys]) =>
        keys.name === "text" &&
        keys.description === "text"
    )
  ).toBe(true);
});


test("suggestions match partial names literally and cap results", async () => {
  const limit = jest.fn().mockResolvedValue([]);
  const find = jest.spyOn(Product, "find").mockReturnValue({
    sort: () => ({
      limit,
    }),
  });
  const next = jest.fn();

  await controller.searchResults(
    {
      query: {
        q: "head",
        suggest: "true",
        limit: "100",
      },
    },
    res(),
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(
    find.mock.calls[0][0].name.test("Studio Headphones")
  ).toBe(true);
  expect(limit).toHaveBeenCalledWith(5);

  await controller.searchResults(
    {
      query: {
        q: "A+B (Pro)",
        suggest: "true",
      },
    },
    res(),
    next,
  );

  const pattern = find.mock.calls[1][0].name;

  expect(
    pattern.test("New A+B (Pro) headset")
  ).toBe(true);
  expect(pattern.test("AAAB Pro")).toBe(false);
});


test("ordinary search retains full-text matching", async () => {
  const find = jest.spyOn(Product, "find").mockReturnValue({
    skip: () => ({
      limit: async () => [],
    }),
  });

  await controller.searchResults(
    {
      query: {
        q: "headphones",
      },
    },
    res(),
    jest.fn(),
  );

  expect(find).toHaveBeenCalledWith({
    $text: {
      $search: "headphones",
    },
  });
});
