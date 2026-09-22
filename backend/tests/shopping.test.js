const Product = require("../models/product");
const FlashSale = require("../models/flashsale");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const Address = require("../models/address");
const { resolveItem } = require("../services/cart");
const wishlist = require("../controllers/wishlist");
const address = require("../controllers/address");
const id = "507f1f77bcf86cd799439011";
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
beforeEach(() => jest.restoreAllMocks());

// Current catalog data, ownership, and model compatibility are regression boundaries.
test("cart prices are resolved from the database", async () => {
  jest.spyOn(Product, "findById").mockResolvedValue({ _id: id, name: "Product", quantity: 3, currentPrice: 50 });
  jest.spyOn(FlashSale, "findOne").mockResolvedValue(null);
  expect((await resolveItem(id, 2)).price).toBe(50);
  await expect(resolveItem(id, 4)).rejects.toMatchObject({ status: 409 });
  await expect(resolveItem(id, 1.5)).rejects.toMatchObject({ status: 400 });
});
test("addresses are filtered by authenticated owner", async () => {
  const find = jest.spyOn(Address, "find").mockResolvedValue([]);
  await address.getAddress({ userId: id }, response(), jest.fn());
  expect(find).toHaveBeenCalledWith({ user: id });
});
test("wishlist stores only product references, ignoring submitted price", async () => {
  jest.spyOn(Product, "exists").mockResolvedValue({ _id: id });
  const update = jest.spyOn(Wishlist, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  await wishlist.addProductToWishlist({ userId: id, body: { productId: id, currentPrice: 0.01 } }, response(), jest.fn());
  expect(update.mock.calls[1][1]).toEqual({ $push: { products: { productId: id } } });
});
test("cart model rejects fractional quantities and missing product IDs", () => {
  const cart = new Cart({ userId: id, products: [{ quantity: 1.5 }] });
  const error = cart.validateSync();
  expect(error.errors["products.0.productId"]).toBeDefined();
  expect(error.errors["products.0.quantity"]).toBeDefined();
});
