const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");
const { addItems } = require("../services/cart");

// Store a catalog reference; displayed product data is resolved when reading.
const addProductToWishlist = asyncHandler(async (req, res) => {
  const productId = requireId(req.body.productId || req.body._id);
  if (!await Product.exists({ _id: productId })) throw fail(404, "Product not found.");
  try { await Wishlist.updateOne({ user: req.userId }, { $setOnInsert: { user: req.userId, products: [] } }, { upsert: true }); } catch (err) { if (err.code !== 11000) throw err; }
  await Wishlist.updateOne({ user: req.userId, "products.productId": { $ne: productId } }, { $push: { products: { productId } } });
  res.json({ message: "Product saved to wishlist." });
});
const getUserWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.userId }).populate("products.productId").lean();
  if (!wishlist) return res.json({ products: [] });
  wishlist.products = wishlist.products.map(item => item.productId).filter(Boolean);
  res.json(wishlist);
});
const removeProductFromWishlist = asyncHandler(async (req, res) => { await Wishlist.updateOne({ user: req.userId }, { $pull: { products: { productId: requireId(req.body.productId) } } }); res.json({ message: "Product removed from wishlist." }); });
const addWishlistToCart = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.userId });
  if (!wishlist?.products.length) throw fail(400, "Wishlist is empty.");
  if (wishlist.products.some(p => !p.productId)) throw fail(409, "Legacy wishlist entries must be re-added from the catalog.");
  res.json({ message: "Wishlist added to cart.", cart: await addItems(req.userId, wishlist.products.map(p => ({ productId: String(p.productId), quantity: 1 }))) });
});
const getWishlists = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Wishlist.find().skip(skip).limit(limit)); });
module.exports = { addProductToWishlist, getUserWishlist, removeProductFromWishlist, addWishlistToCart, getWishlists };
