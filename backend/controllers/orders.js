const Order = require("../models/orders");
const { asyncHandler, fail, pagination, requireId } = require("../utils/http");

// Management routes are admin-only; shopper history is always owner-scoped.
const getOrders = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(orders);
});

const getUserOrder = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);
  const orders = await Order.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(orders);
});

// A return URL identifies a purchase; only the stored order proves its status.
const getPaymentStatus = asyncHandler(async (req, res) => {
  const {
    session_id: sessionId,
    order_id: orderId,
    checkout_key: checkoutKey,
  } = req.query;
  const references = [sessionId, orderId, checkoutKey].filter(
    (value) => value !== undefined,
  );

  if (references.length !== 1) {
    throw fail(400, "Provide exactly one payment reference.");
  }

  const query = { user: req.userId };

  if (sessionId !== undefined) {
    if (
      typeof sessionId !== "string" ||
      !/^cs_[a-zA-Z0-9_]{1,240}$/.test(sessionId)
    ) {
      throw fail(400, "Invalid payment reference.");
    }
    query.stripeSessionId = sessionId;
  } else if (orderId !== undefined) {
    query._id = requireId(orderId);
  } else {
    if (
      typeof checkoutKey !== "string" ||
      !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)
    ) {
      throw fail(400, "Invalid payment reference.");
    }
    query.checkoutKey = checkoutKey;
  }

  const order = await Order.findOne(query).lean();

  if (!order) {
    throw fail(404, "Payment details are not available for this account.");
  }

  res.set("Cache-Control", "no-store");
  res.json({
    _id: order._id,
    checkoutKey: order.checkoutKey,
    provider: order.paymentProvider || "stripe",
    paymentStatus: order.paymentStatus,
    items: order.items,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    currency: order.currency,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
  });
});

module.exports = { getOrders, getUserOrder, getPaymentStatus };
