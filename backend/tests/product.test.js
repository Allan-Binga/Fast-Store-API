const Product = require("../models/product");
const controller = require("../controllers/product");
const { getCategoryProducts } = require("../controllers/category");
const id = "507f1f77bcf86cd799439011";
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
beforeEach(() => jest.restoreAllMocks());

// Exercise schema field names and edge cases that the legacy fixtures missed.
test("zero stock and zero prices create a product without division by zero", async () => {
  jest.spyOn(Product, "findOne").mockResolvedValue(null);
  const create = jest.spyOn(Product, "create").mockImplementation(async value => value);
  const next = jest.fn(), response = res();
  await controller.addNewProduct({ body: { name: "Free", currentPrice: 0, originalPrice: 0, quantity: 0, category: ["Home"], description: "Description", image: "image", reviews: { rate: 0, count: 0 } } }, response, next);
  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0].discount).toBe(0);
  expect(response.status).toHaveBeenCalledWith(201);
});
test("product updates persist name and currentPrice and recalculate discounts", async () => {
  const product = { name: "Old", currentPrice: 20, originalPrice: 40, quantity: 5, category: ["Home"], description: "Description", image: "image", save: jest.fn() };
  jest.spyOn(Product, "findById").mockResolvedValue(product);
  await controller.updateProduct({ params: { id }, body: { name: "New", currentPrice: 10 } }, res(), jest.fn());
  expect(product.name).toBe("New"); expect(product.currentPrice).toBe(10); expect(product.discount).toBe(75); expect(product.save).toHaveBeenCalled();
});
test("invalid product IDs produce a client error", async () => {
  const next = jest.fn(); await controller.getSingleProduct({ params: { id: "bad" } }, res(), next); expect(next.mock.calls[0][0].status).toBe(400);
});
test("category names are escaped as literal text", async () => {
  const find = jest.spyOn(Product, "find").mockReturnValue({ sort: () => ({ skip: () => ({ limit: async () => [] }) }) });
  await getCategoryProducts({ params: { category: "Home (A+B)" }, query: {} }, res(), jest.fn());
  const regex = find.mock.calls[0][0].category;
  expect(regex.test("Home (A+B)")).toBe(true); expect(regex.test("Home AAAB")).toBe(false);
});
test("search index is declared on the catalog schema", () => { expect(Product.schema.indexes().some(([keys]) => keys.name === "text" && keys.description === "text")).toBe(true); });
