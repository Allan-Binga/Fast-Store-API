const crypto = require("crypto");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const Address = require("../models/address");
const { asyncHandler, fail, requireId } = require("../utils/http");
const { resolveItem } = require("../services/cart");
const { reserveOrder, settleMpesaOrder, expireMpesaOrder } = require("../services/orders");
const { stkPush } = require("../services/daraja");

function validateCheckoutKey(req) {
  const key = req.get("Idempotency-Key");
  if (typeof key !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(key)) {
    throw fail(400, "Provide a valid Idempotency-Key and reuse it when retrying.");
  }
  return key;
}

function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) {
    throw fail(400, "Provide 1-100 items.");
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

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) return digits;
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^7\d{8}$/.test(digits) || /^1\d{8}$/.test(digits)) return `254${digits}`;
  throw fail(400, "Provide a valid Safaricom phone number.");
}

function mpesaAmount(orderTotal) {
  const multiplier = Number(process.env.MPESA_AMOUNT_MULTIPLIER || 1);
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new Error("MPESA_AMOUNT_MULTIPLIER must be a positive number.");
  }
  const amount = Math.round(Number(orderTotal) * multiplier);
  if (!Number.isInteger(amount) || amount < 1) {
    throw fail(409, "M-Pesa requires a positive whole-shilling amount.");
  }
  return amount;
}

function callbackUrl() {
  const base = process.env.MPESA_CALLBACK_URL || process.env.API_PUBLIC_URL;
  if (!base) throw new Error("Set MPESA_CALLBACK_URL or API_PUBLIC_URL for M-Pesa callbacks.");
  return base.endsWith("/api/webhook/mpesa")
    ? base
    : `${base.replace(/\/$/, "")}/api/webhook/mpesa`;
}

function callbackMetadata(callback) {
  return Object.fromEntries(
    (callback?.CallbackMetadata?.Item || [])
      .filter((item) => item?.Name)
      .map((item) => [item.Name, item.Value]),
  );
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
    totalAmount: mpesaAmount(totalCents / 100),
    currency: "kes",
    paymentStatus: "pending",
    paymentProvider: "mpesa",
    shippingAddress: address,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
}

const createMpesaStkPush = asyncHandler(async (req, res) => {
  const checkoutKey = validateCheckoutKey(req);
  const inputs = validateItems(req.body.items);
  const source = req.body.source || "cart";
  if (!["cart", "buy-now"].includes(source)) throw fail(400, "Invalid checkout source.");
  const addressId = requireId(req.body.addressId);
  const phoneNumber = normalizePhone(req.body.phoneNumber);
  const requestHash = purchaseHash(inputs, addressId, source);

  let order = await Order.findOne({ user: req.userId, checkoutKey });
  if (!order) {
    try {
      order = await createReservedOrder(req, checkoutKey, inputs, addressId, source, requestHash);
    } catch (error) {
      if (error.code !== 11000) throw error;
      order = await Order.findOne({ user: req.userId, checkoutKey });
    }
  }

  if (!order || order.requestHash !== requestHash) {
    throw fail(409, "This checkout key belongs to a different purchase.");
  }
  if (order.paymentProvider !== "mpesa") {
    throw fail(409, "This checkout key is already being used with another payment method.");
  }
  if (order.paymentStatus !== "pending" || !order.stockReserved || order.expiresAt <= new Date()) {
    throw fail(409, "Checkout has finished or expired. Use a new checkout key.");
  }
  if (order.mpesaCheckoutRequestId) {
    return res.json({ orderId: order._id, paymentStatus: order.paymentStatus });
  }

  const prompt = await stkPush({
    amount: Math.round(order.totalAmount),
    phoneNumber,
    accountReference: String(order._id).slice(-12),
    transactionDesc: `FastStore order ${String(order._id).slice(-8)}`,
    callbackUrl: callbackUrl(),
  });

  await Order.updateOne(
    { _id: order._id, mpesaCheckoutRequestId: { $exists: false } },
    {
      $set: {
        mpesaCheckoutRequestId: prompt.CheckoutRequestID,
        mpesaMerchantRequestId: prompt.MerchantRequestID,
      },
    },
  );
  res.status(201).json({
    orderId: order._id,
    checkoutRequestId: prompt.CheckoutRequestID,
    merchantRequestId: prompt.MerchantRequestID,
    paymentStatus: "pending",
  });
});

const handleMpesaCallback = asyncHandler(async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return res.json({ received: true });

  if (Number(callback.ResultCode) === 0) {
    const metadata = callbackMetadata(callback);
    await settleMpesaOrder({
      checkoutRequestId: callback.CheckoutRequestID,
      merchantRequestId: callback.MerchantRequestID,
      amount: Number(metadata.Amount),
      receiptNumber: metadata.MpesaReceiptNumber,
      phoneNumber: metadata.PhoneNumber,
    });
  } else {
    await expireMpesaOrder(callback.CheckoutRequestID);
  }

  res.json({ received: true });
});

module.exports = { createMpesaStkPush, handleMpesaCallback };
