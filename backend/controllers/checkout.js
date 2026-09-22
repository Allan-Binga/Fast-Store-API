const crypto = require("crypto");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const Address = require("../models/address");
const { asyncHandler, fail, requireId } = require("../utils/http");
const { resolveItem } = require("../services/cart");
const { reserveOrder } = require("../services/orders");
const getStripe = require("../services/stripe");

// The browser supplies product IDs and quantities, never trusted prices.
const createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const checkoutKey = req.get("Idempotency-Key");
  if (typeof checkoutKey !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)) throw fail(400, "Provide an Idempotency-Key of 16–100 letters, digits, underscores or hyphens; reuse it when retrying.");
  if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) throw fail(400, "Provide 1–100 items.");
  const inputs = req.body.items.map(item => ({ productId: requireId(item?.productId), quantity: item?.quantity }));
  if (inputs.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) || new Set(inputs.map(i => i.productId)).size !== inputs.length) throw fail(400, "Invalid quantities or duplicate product IDs.");
  const source = req.body.source || "cart";
  if (!["cart", "buy-now"].includes(source)) throw fail(400, "Invalid checkout source.");
  const addressId = requireId(req.body.addressId);
  const requestHash = crypto.createHash("sha256").update(JSON.stringify({ items: [...inputs].sort((a,b) => a.productId.localeCompare(b.productId)), addressId, source })).digest("hex");
  let order = await Order.findOne({ user: req.userId, checkoutKey });
  if (order && order.requestHash !== requestHash) throw fail(409, "This checkout key belongs to a different purchase.");
  if (!order) {
    const address = await Address.findOne({ _id: addressId, user: req.userId }).lean();
    if (!address) throw fail(404, "Shipping address not found.");
    const cart = source === "cart" ? await Cart.findOne({ userId: req.userId }) : null;
    const cartItems = (cart?.products || []).filter(item => inputs.some(input => input.productId === String(item.productId) && input.quantity === item.quantity)).map(item => ({ itemId: item._id, quantity: item.quantity }));
    const items = [];
    for (const input of inputs) items.push(await resolveItem(input.productId, input.quantity));
    const totalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    try {
      order = await reserveOrder({ user: req.userId, checkoutKey, requestHash, items, cartItems, totalAmount: totalCents / 100, currency: "usd", paymentStatus: "pending", shippingAddress: address, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    } catch (err) {
      if (err.code !== 11000) throw err;
      order = await Order.findOne({ user: req.userId, checkoutKey });
      if (!order || order.requestHash !== requestHash) throw fail(409, "Checkout key conflict.");
    }
  }
  if (order.requestHash !== requestHash) throw fail(409, "Checkout key conflict.");
  if (order.paymentStatus !== "pending" || order.expiresAt <= new Date()) throw fail(409, "Checkout has finished or expired. Use a new checkout key.");
  if (order.stripeSessionId) return res.json({ id: order.stripeSessionId, url: order.stripeSessionUrl, orderId: order._id });
  // Fixed order-based idempotency makes a network retry reuse the Stripe session.
  const session = await stripe.checkout.sessions.create({
    mode: "payment", payment_method_types: ["card"],
    line_items: order.items.map(item => ({ price_data: { currency: "usd", unit_amount: Math.round(item.price * 100), product_data: { name: item.name } }, quantity: item.quantity })),
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    expires_at: Math.floor(order.expiresAt.getTime() / 1000),
    metadata: { orderId: String(order._id), user: String(order.user) },
    payment_intent_data: { metadata: { orderId: String(order._id), user: String(order.user) } },
  }, { idempotencyKey: `order-${order._id}` });
  await Order.updateOne({ _id: order._id }, { $set: { stripeSessionId: session.id, stripeSessionUrl: session.url } });
  res.json({ id: session.id, url: session.url, orderId: order._id });
});
module.exports = { createCheckoutSession };
