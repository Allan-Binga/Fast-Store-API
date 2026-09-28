const crypto = require("crypto");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const Address = require("../models/address");
const { asyncHandler, fail, requireId } = require("../utils/http");
const { resolveItem } = require("../services/cart");
const { reserveOrder, settlePayPalOrder } = require("../services/orders");
const getPayPal = require("../services/paypal");

function validateCheckoutKey(req) {
  const key = req.get("Idempotency-Key");
  if (typeof key !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) {
    throw fail(400, "Provide a valid Idempotency-Key and reuse it when retrying.");
  }
  return key;
}

function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) {
    throw fail(400, "Provide 1–100 items.");
  }
  const inputs = items.map((item) => ({
    productId: requireId(item?.productId),
    quantity: item?.quantity,
  }));
  const invalid = inputs.some(
    (item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999,
  );
  if (invalid || new Set(inputs.map((item) => item.productId)).size !== inputs.length) {
    throw fail(400, "Invalid quantities or duplicate product IDs.");
  }
  return inputs;
}

function purchaseHash(inputs, addressId, source) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({
      items: [...inputs].sort((a, b) => a.productId.localeCompare(b.productId)),
      addressId,
      source,
    }))
    .digest("hex");
}

async function createReservedOrder(req, checkoutKey, inputs, addressId, source, requestHash) {
  const address = await Address.findOne({ _id: addressId, user: req.userId }).lean();
  if (!address) throw fail(404, "Shipping address not found.");

  const cart = source === "cart" ? await Cart.findOne({ userId: req.userId }) : null;
  const cartItems = (cart?.products || [])
    .filter((item) => inputs.some((input) =>
      input.productId === String(item.productId) && input.quantity === item.quantity))
    .map((item) => ({ itemId: item._id, quantity: item.quantity }));
  const items = [];
  for (const input of inputs) items.push(await resolveItem(input.productId, input.quantity));
  const totalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  );

  return reserveOrder({
    user: req.userId,
    checkoutKey,
    requestHash,
    items,
    cartItems,
    totalAmount: totalCents / 100,
    currency: "usd",
    paymentStatus: "pending",
    paymentProvider: "paypal",
    shippingAddress: address,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
}

const createPayPalOrder = asyncHandler(async (req, res) => {
  const checkoutKey = validateCheckoutKey(req);
  const inputs = validateItems(req.body.items);
  const source = req.body.source || "cart";
  if (!["cart", "buy-now"].includes(source)) throw fail(400, "Invalid checkout source.");
  const addressId = requireId(req.body.addressId);
  const requestHash = purchaseHash(inputs, addressId, source);

  let order = await Order.findOne({ user: req.userId, checkoutKey });
  if (!order) {
    try {
      order = await createReservedOrder(
        req, checkoutKey, inputs, addressId, source, requestHash,
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      order = await Order.findOne({ user: req.userId, checkoutKey });
    }
  }

  if (!order || order.requestHash !== requestHash) {
    throw fail(409, "This checkout key belongs to a different purchase.");
  }
  if (order.paymentProvider !== "paypal") {
    throw fail(409, "This checkout key is already being used with Stripe.");
  }
  if (order.paymentStatus !== "pending" || !order.stockReserved || order.expiresAt <= new Date()) {
    throw fail(409, "Checkout has finished or expired. Use a new checkout key.");
  }
  if (order.paypalOrderId) {
    return res.json({ id: order.paypalOrderId, orderId: order._id });
  }

  const response = await getPayPal().orders.createOrder({
    body: {
      intent: "CAPTURE",
      purchaseUnits: [{
        referenceId: String(order._id),
        customId: String(order._id),
        invoiceId: String(order._id),
        amount: {
          currencyCode: order.currency.toUpperCase(),
          value: order.totalAmount.toFixed(2),
        },
      }],
    },
    paypalRequestId: `create-${order._id}`,
    prefer: "return=representation",
  });

  const paypalOrder = response.result;
  await Order.updateOne(
    { _id: order._id, paypalOrderId: { $exists: false } },
    { $set: { paypalOrderId: paypalOrder.id } },
  );
  res.status(201).json({ id: paypalOrder.id, orderId: order._id });
});

const capturePayPalOrder = asyncHandler(async (req, res) => {
  const paypalOrderId = req.params.paypalOrderId;
  if (typeof paypalOrderId !== "string" || !/^[A-Z0-9]{1,32}$/i.test(paypalOrderId)) {
    throw fail(400, "Invalid PayPal order ID.");
  }

  const order = await Order.findOne({
    user: req.userId,
    paymentProvider: "paypal",
    paypalOrderId,
  });
  if (!order) throw fail(404, "PayPal checkout not found.");
  if (order.paymentStatus === "paid") {
    return res.json({ orderId: order._id, paymentStatus: "paid" });
  }
  if (!order.stockReserved || order.expiresAt <= new Date()) {
    throw fail(409, "This checkout has expired. Return to your cart to try again.");
  }

  const response = await getPayPal().orders.captureOrder({
    id: paypalOrderId,
    paypalRequestId: `capture-${order._id}`,
    prefer: "return=representation",
  });
  const settled = await settlePayPalOrder(response.result);
  res.json({ orderId: settled._id, paymentStatus: settled.paymentStatus });
});

module.exports = { createPayPalOrder, capturePayPalOrder };
