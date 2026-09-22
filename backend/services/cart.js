const Cart = require("../models/cart");
const Product = require("../models/product");
const FlashSale = require("../models/flashsale");
const { fail, requireId } = require("../utils/http");

// Resolve every purchase against current catalog data and active sale prices.
async function resolveItem(productId, quantity) {
  requireId(productId);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw fail(400, "Quantity must be an integer from 1 to 999.");
  const product = await Product.findById(productId);
  if (!product) throw fail(404, "Product not found.");
  if (product.quantity < quantity) throw fail(409, "Requested quantity is out of stock.");
  const now = new Date();
  const sale = await FlashSale.findOne({ _id: productId, startTime: { $lte: now }, endTime: { $gt: now }, quantityAvailable: { $gte: quantity } });
  return { productId: product._id, name: product.name, description: product.description, image: product.image, price: sale ? Math.min(product.currentPrice, sale.currentPrice) : product.currentPrice, quantity, saleId: sale?._id };
}
async function addItems(userId, products) {
  if (!Array.isArray(products) || !products.length || products.length > 100) throw fail(400, "Provide 1–100 products.");
  const seen = new Set();
  const items = [];
  for (const item of products) {
    if (!item || typeof item !== "object") throw fail(400, "Invalid product.");
    if (seen.has(item.productId)) throw fail(400, "Duplicate product ID.");
    seen.add(item.productId);
    items.push(await resolveItem(item.productId, item.quantity ?? 1));
  }
  // The unique owner index makes simultaneous first-cart creation safe.
  try { await Cart.updateOne({ userId }, { $setOnInsert: { userId, products: [] } }, { upsert: true }); } catch (err) { if (err.code !== 11000) throw err; }
  const cart = await Cart.findOneAndUpdate({ userId, "products.productId": { $nin: items.map(i => i.productId) } }, { $push: { products: { $each: items } } }, { new: true, runValidators: true });
  if (!cart) throw fail(409, "Product already in cart. Update its quantity instead.");
  return cart;
}
module.exports = { resolveItem, addItems };
