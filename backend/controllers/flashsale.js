const FlashSale = require("../models/flashsale");
const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");
const { addItems } = require("../services/cart");

// Expired, future and sold-out offers are excluded from storefront listings.
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const now = new Date(), { limit, skip } = pagination(req);
  res.json(await FlashSale.find({ startTime: { $lte: now }, endTime: { $gt: now }, quantityAvailable: { $gt: 0 } }).skip(skip).limit(limit));
});
const addProductToFlashSale = asyncHandler(async (req, res) => {
  const product = await Product.findById(requireId(req.body.productId));
  if (!product) throw fail(404, "Product not found.");
  const { currentPrice, quantityAvailable } = req.body;
  const startTime = new Date(req.body.startTime), endTime = new Date(req.body.endTime);
  if (!Number.isFinite(currentPrice) || currentPrice < 0 || currentPrice >= product.currentPrice || !Number.isInteger(quantityAvailable) || quantityAvailable < 1 || quantityAvailable > product.quantity || !Number.isFinite(startTime.getTime()) || !Number.isFinite(endTime.getTime()) || endTime <= startTime || endTime <= new Date()) throw fail(400, "Invalid sale price, stock or dates.");
  const { name, category, description, image, reviews } = product;
  res.status(201).json(await FlashSale.create({ _id: product._id, name, category, description, image, reviews, currentPrice, originalPrice: product.currentPrice, discount: Math.round((1 - currentPrice / product.currentPrice) * 100), quantityAvailable, startTime, endTime }));
});
// Use the same authenticated, schema-compatible cart service for sale items.
const addFlashsaleProductsToCart = asyncHandler(async (req, res) => {
  const productId = requireId(req.body.productId), now = new Date();
  if (!await FlashSale.exists({ _id: productId, startTime: { $lte: now }, endTime: { $gt: now }, quantityAvailable: { $gte: req.body.quantity ?? 1 } })) throw fail(409, "Sale is not available.");
  res.json({ message: "Added to cart.", cart: await addItems(req.userId, [{ productId, quantity: req.body.quantity ?? 1 }]) });
});
module.exports = { getFlashSaleProducts, addProductToFlashSale, addFlashsaleProductsToCart };
