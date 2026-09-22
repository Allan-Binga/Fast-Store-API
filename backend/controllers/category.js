const Product = require("../models/product");
const { asyncHandler, fail, pagination } = require("../utils/http");

// Escape category names rather than interpreting them as regular expressions.
const getAllCategories = asyncHandler(async (req, res) => res.json(await Product.distinct("category")));
const getCategoryProducts = asyncHandler(async (req, res) => {
  const category = req.params.category;
  if (!category || category.length > 100) throw fail(400, "Invalid category.");
  const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const { limit, skip } = pagination(req);
  res.json(await Product.find({ category: new RegExp(`^${escaped}$`, "i") }).sort({ _id: 1 }).skip(skip).limit(limit));
});
module.exports = { getAllCategories, getCategoryProducts };
