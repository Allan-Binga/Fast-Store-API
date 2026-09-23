const Cart = require("../models/cart");
const Product = require("../models/product");
const { asyncHandler, fail, requireId, pagination } = require("../utils/http");
const { addItems, resolveItem } = require("../services/cart");

// Customer cart mutations always use the authenticated owner.
const addProductToCart = asyncHandler(async (req, res) => res.json(
  { message: "Added to cart.", cart: await addItems(req.userId, req.body.products) }
));

//Remve product from cart
const removeProductFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ userId: req.userId }, { $pull: { products: { productId: requireId(req.body.productId) } } }, { new: true });
  res.json({ message: "Product removed.", cart: cart || { products: [] } });
});

//Clear Cart
const clearCart = asyncHandler(async (req, res) => { await Cart.updateOne({ userId: req.userId }, { $set: { products: [] } }); res.json({ message: "Cart cleared." }); });

//Update cart Quantity for a product
const updateQuantity = asyncHandler(async (req, res) => {
  const item = await resolveItem(req.body.productId, req.body.quantity);
  const cart = await Cart.findOneAndUpdate({ userId: req.userId, "products.productId": item.productId }, { $set: { "products.$.quantity": item.quantity, "products.$.price": item.price } }, { new: true, runValidators: true });
  if (!cart) throw fail(404, "Cart item not found.");
  res.json(cart);
});

// Display current prices and explicit unavailable states rather than stale snapshots.
const getCartUser = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId }).lean();
  if (!cart) return res.json({ products: [] });
  cart.products = await Promise.all(cart.products.map(async item => {
    const product = await Product.findById(item.productId);
    if (!product || product.quantity < item.quantity) return { ...item, available: false };
    return { ...item, ...await resolveItem(String(item.productId), item.quantity), available: true };
  }));
  res.json(cart);
});

//Fetch Cart
const getCart = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Cart.find().skip(skip).limit(limit)); });


module.exports = { addProductToCart, removeProductFromCart, clearCart, getCartUser, getCart, updateQuantity };
