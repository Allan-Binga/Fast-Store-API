const crypto = require("crypto");
const Order = require("../models/orders");
const Cart = require("../models/cart");
const Address = require("../models/address");
const { asyncHandler, fail, pagination, requireId } = require("../utils/http");
const { resolveItem } = require("../services/cart");
const { reserveOrder, settleOrder } = require("../services/orders");
const getStripe = require("../services/stripe");


const getCheckouts = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);
  const query = {};

  if (req.query.status !== undefined) {
    const statuses = [
      "pending",
      "paid",
      "partially_refunded",
      "refunded",
      "failed",
      "expired",
    ];

    if (!statuses.includes(req.query.status)) {
      throw fail(400, "Invalid checkout status.");
    }

    query.paymentStatus = req.query.status;
  }

  if (req.query.provider !== undefined) {
    if (!["stripe", "paypal", "mpesa"].includes(req.query.provider)) {
      throw fail(400, "Invalid checkout provider.");
    }

    query.paymentProvider = req.query.provider;
  }

  res.json(
    await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  );
});

// The browser supplies product IDs and quantities, never trusted prices.
const createCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const checkoutKey = req.get("Idempotency-Key");
  if (
    typeof checkoutKey !== "string" ||
    !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)
  )
    throw fail(
      400,
      "Provide an Idempotency-Key of 16–100 letters, digits, underscores or hyphens; reuse it when retrying.",
    );
  if (
    !Array.isArray(req.body.items) ||
    !req.body.items.length ||
    req.body.items.length > 100
  )
    throw fail(400, "Provide 1–100 items.");
  const inputs = req.body.items.map((item) => ({
    productId: requireId(item?.productId),
    quantity: item?.quantity,
  }));
  if (
    inputs.some(
      (item) =>
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 999,
    ) ||
    new Set(inputs.map((i) => i.productId)).size !== inputs.length
  )
    throw fail(400, "Invalid quantities or duplicate product IDs.");
  const source = req.body.source || "cart";
  if (!["cart", "buy-now"].includes(source))
    throw fail(400, "Invalid checkout source.");
  const addressId = requireId(req.body.addressId);
  const requestHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        items: [...inputs].sort((a, b) =>
          a.productId.localeCompare(b.productId),
        ),
        addressId,
        source,
      }),
    )
    .digest("hex");
  let order = await Order.findOne({ user: req.userId, checkoutKey });
  if (order && order.requestHash !== requestHash)
    throw fail(409, "This checkout key belongs to a different purchase.");
  if (!order) {
    const address = await Address.findOne({
      _id: addressId,
      user: req.userId,
    }).lean();
    if (!address) throw fail(404, "Shipping address not found.");
    const cart =
      source === "cart" ? await Cart.findOne({ userId: req.userId }) : null;
    const cartItems = (cart?.products || [])
      .filter((item) =>
        inputs.some(
          (input) =>
            input.productId === String(item.productId) &&
            input.quantity === item.quantity,
        ),
      )
      .map((item) => ({ itemId: item._id, quantity: item.quantity }));
    const items = [];
    try {
      for (const input of inputs) {
        items.push(await resolveItem(input.productId, input.quantity));
      }
    } catch (error) {
      // A stock rejection here happens before this request reserves an order.
      if (error.status === 409) {
        return res
          .status(409)
          .json({ message: error.message, checkoutCreated: false });
      }
      throw error;
    }
    const totalCents = items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0,
    );
    try {
      order = await reserveOrder({
        user: req.userId,
        checkoutKey,
        requestHash,
        items,
        cartItems,
        totalAmount: totalCents / 100,
        currency: "usd",
        paymentStatus: "pending",
        paymentProvider: "stripe",
        shippingAddress: address,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    } catch (err) {
      if (err.status === 409) {
        // Stock failures roll back the reservation transaction.
        return res
          .status(409)
          .json({ message: err.message, checkoutCreated: false });
      }
      if (err.code !== 11000) throw err;
      order = await Order.findOne({ user: req.userId, checkoutKey });
      if (!order || order.requestHash !== requestHash)
        throw fail(409, "Checkout key conflict.");
    }
  }
  if (order.requestHash !== requestHash)
    throw fail(409, "Checkout key conflict.");
  if (order.paymentProvider && order.paymentProvider !== "stripe")
    throw fail(409, "This checkout key is already being used with PayPal.");
  if (order.paymentStatus !== "pending" || order.expiresAt <= new Date())
    throw fail(
      409,
      "Checkout has finished or expired. Use a new checkout key.",
    );
  if (order.stripeSessionId)
    return res.json({
      id: order.stripeSessionId,
      url: order.stripeSessionUrl,
      orderId: order._id,
    });
  // Fixed order-based idempotency makes a network retry reuse the Stripe session.
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.name },
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-result?order_id=${order._id}&cancelled=1`,
      expires_at: Math.floor(order.expiresAt.getTime() / 1000),
      metadata: { orderId: String(order._id), user: String(order.user) },
      payment_intent_data: {
        metadata: { orderId: String(order._id), user: String(order.user) },
      },
    },
    { idempotencyKey: `order-${order._id}` },
  );
  await Order.updateOne(
    { _id: order._id },
    { $set: { stripeSessionId: session.id, stripeSessionUrl: session.url } },
  );
  res.json({ id: session.id, url: session.url, orderId: order._id });
});

// Reopen the same owner-scoped Stripe Checkout Session without reserving stock again.
const resumeCheckoutSession = asyncHandler(async (req, res) => {
  const orderId = requireId(req.body.orderId);
  const order = await Order.findOne({ _id: orderId, user: req.userId });

  if (!order) {
    throw fail(404, "Checkout not found.");
  }
  if (order.paymentStatus === "paid") {
    return res.status(409).json({
      message: "Payment has already been confirmed.",
      paymentStatus: "paid",
    });
  }
  if (order.paymentStatus === "expired" || !order.stockReserved) {
    return res.status(409).json({
      message: "This checkout has expired. Return to your cart to try again.",
      paymentStatus: "expired",
    });
  }
  if (!order.stripeSessionId) {
    throw fail(
      409,
      "The payment session is not ready. Please try again shortly.",
    );
  }

  const session = await getStripe().checkout.sessions.retrieve(
    order.stripeSessionId,
  );

  if (
    session.metadata?.orderId !== String(order._id) ||
    session.metadata?.user !== String(order.user)
  ) {
    throw fail(409, "The payment session does not match this order.");
  }

  if (session.status === "complete" || session.status === "expired") {
    const settled = await settleOrder(session);
    const paymentStatus = settled.paymentStatus;
    return res.status(409).json({
      message:
        paymentStatus === "paid"
          ? "Payment has already been confirmed."
          : "This checkout has expired. Return to your cart to try again.",
      paymentStatus,
    });
  }

  if (session.status !== "open" || typeof session.url !== "string") {
    throw fail(409, "This payment session cannot be resumed.");
  }

  res.set("Cache-Control", "no-store");
  res.json({ url: session.url, expiresAt: order.expiresAt });
});

module.exports = { getCheckouts, createCheckoutSession, resumeCheckoutSession };
