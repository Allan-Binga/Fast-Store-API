const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");

// Bound catalog queries and return stable pagination without changing array responses.
const getAllProducts = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Product.find().sort({ _id: 1 }).skip(skip).limit(limit)); });
const getLimitedProducts = getAllProducts;
const getNewArrivals = asyncHandler(async (req, res) => res.json(await Product.find({ newArrival: true, quantity: { $gt: 0 } }).sort({ createdAt: -1 }).limit(10)));
const getSingleProduct = asyncHandler(async (req, res) => { const product = await Product.findById(requireId(req.params.id)); if (!product) throw fail(404, "Product not found."); res.json(product); });
const searchResults = asyncHandler(async (req, res) => {
  if (typeof req.query.q !== "string" || !req.query.q.trim() || req.query.q.length > 200) throw fail(400, "Provide a search query of 1–200 characters.");
  const { limit, skip } = pagination(req);
  // Autocomplete treats input as literal text and returns at most five name matches.
  if (req.query.suggest === "true") {
    const escaped = req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return res.json(await Product.find({ name: new RegExp(escaped, "i") }).sort({ name: 1, _id: 1 }).limit(Math.min(limit, 5)));
  }
  res.json(await Product.find({ $text: { $search: req.query.q.trim() } }).skip(skip).limit(limit));
});

// Creation and updates share the actual schema field names and price rules.
const fields = ["name", "currentPrice", "originalPrice", "category", "quantity", "description", "image", "reviews", "newArrival"];
function productData(body, existing = {}) {
  if (Object.keys(body).some(key => !fields.includes(key))) throw fail(400, "Unknown product field.");
  const data = { ...existing, ...body };
  if (![data.name, data.description, data.image].every(v => typeof v === "string" && v.trim()) || !Array.isArray(data.category) || !data.category.length || data.category.some(v => typeof v !== "string" || !v.trim())) throw fail(400, "Valid product name, description, image and categories are required.");
  if (![data.currentPrice, data.originalPrice].every(v => typeof v === "number" && Number.isFinite(v) && v >= 0) || data.currentPrice > data.originalPrice) throw fail(400, "Invalid product prices.");
  if (!Number.isInteger(data.quantity) || data.quantity < 0) throw fail(400, "Stock must be a non-negative integer.");
  data.discount = data.originalPrice === 0 ? 0 : Math.round((1 - data.currentPrice / data.originalPrice) * 100);
  return data;
}
const addNewProduct = asyncHandler(async (req, res) => {
  const data = productData(req.body);
  if (await Product.findOne({ name: data.name })) throw fail(409, "Product already exists.");
  res.status(201).json(await Product.create({ ...data, newArrival: data.newArrival ?? true }));
});
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(requireId(req.params.id));
  if (!product) throw fail(404, "Product not found.");
  const existing = Object.fromEntries(fields.map(key => [key, product[key]]));
  Object.assign(product, productData(req.body, existing));
  await product.save();
  res.json(product);
});
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(requireId(req.params.id));
  if (!product) throw fail(404, "Product not found.");
  // Remove dependent merchandising references; historical order snapshots remain intact.
  await Promise.all([
    require("../models/brand").updateMany({}, { $pull: { products: product._id } }),
    require("../models/promo").deleteMany({ product: product._id }),
    require("../models/flashsale").deleteOne({ _id: product._id }),
    require("../models/cart").updateMany({}, { $pull: { products: { productId: product._id } } }),
    require("../models/wishlist").updateMany({}, { $pull: { products: { productId: product._id } } }),
  ]);
  res.json({ message: "Product deleted." });
});
module.exports = { getAllProducts, getLimitedProducts, getNewArrivals, getSingleProduct, searchResults, addNewProduct, updateProduct, deleteProduct };
