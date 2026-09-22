const Promo = require("../models/promo");
const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");

// Only active promotions are visible; optional type filters are validated.
const getPromos = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (type && !["deal", "mega-deal"].includes(type)) throw fail(400, "Invalid promo type.");
  const { limit, skip } = pagination(req);
  const promos = await Promo.find({ active: true, ...(type ? { type } : {}) }).sort({ priority: 1 }).skip(skip).limit(limit).populate("product");
  res.json(promos.filter(p => p.product));
});
const addProductToPromo = asyncHandler(async (req, res) => {
  const product = requireId(req.body.productId), { type, priority = 0 } = req.body;
  if (!["deal", "mega-deal"].includes(type) || !Number.isInteger(priority)) throw fail(400, "Invalid promo type or priority.");
  if (!await Product.exists({ _id: product })) throw fail(404, "Product not found.");
  res.status(201).json(await Promo.create({ product, type, priority }));
});
module.exports = { getPromos, addProductToPromo };
