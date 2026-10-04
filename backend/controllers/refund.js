const mongoose = require("mongoose");

const Refund = require("../models/refund");
const Order = require("../models/orders");
const {
  processRefund,
} = require("../services/refunds");
const {
  asyncHandler,
  fail,
  pagination,
  requireId,
} = require("../utils/http");


const reasons = new Set([
  "customer_request",
  "cancelled_before_shipping",
  "damaged_product",
  "wrong_product",
  "non_delivery",
  "duplicate_payment",
  "unable_to_fulfill",
  "fraudulent",
  "other",
]);

const money = (value) =>
  Math.round(Number(value) * 100) / 100;


const requestRefund = asyncHandler(async (req, res) => {
  const orderId = requireId(req.params.orderId);
  const reason = req.body.reason;
  const destination = req.body.destination || "original";
  if (!["original", "wallet"].includes(destination)) throw fail(400, "Choose a refund destination.");
  const explanation = req.body.explanation;
  const evidenceImages = (req.files || []).map(
    (file) => file.location || file.path
  );

  if (!reasons.has(reason)) {
    throw fail(400, "Select a valid refund reason.");
  }

  const evidenceReasons = [
    "damaged_product",
    "wrong_product",
  ];

  if (
    evidenceImages.length > 0 &&
    !evidenceReasons.includes(reason)
  ) {
    throw fail(
      400,
      "Photo evidence is only accepted for damaged or incorrect products."
    );
  }

  if (
    evidenceImages.length > 2 ||
    evidenceImages.some(
      (image) => typeof image !== "string" || !image.trim()
    )
  ) {
    throw fail(
      400,
      "Upload no more than two valid evidence photos."
    );
  }

  if (
    explanation !== undefined &&
    (
      typeof explanation !== "string" ||
      !explanation.trim() ||
      explanation.length > 1000
    )
  ) {
    throw fail(
      400,
      "Refund explanation must contain 1–1000 characters."
    );
  }

  let createdRefund;

  await mongoose.connection.transaction(async (session) => {
    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
      paymentProvider: {
        $in: ["stripe", "paypal", "wallet"],
      },
      paymentStatus: {
        $in: ["paid", "partially_refunded"],
      },
    }).session(session);

    if (!order) {
      throw fail(
        404,
        "A refundable paid order was not found."
      );
    }

    const providerPaymentId =
      order.paymentProvider === "stripe"
        ? order.stripePaymentIntentId
        : order.paymentProvider === "wallet" ? String(order._id) : order.paypalCaptureId;

    if (!providerPaymentId) {
      throw fail(
        409,
        "The provider payment reference is unavailable."
      );
    }

    const remaining = money(
      order.totalAmount -
      (order.refundedAmount || 0) -
      (order.refundPendingAmount || 0)
    );

    const amount =
      req.body.amount === undefined
        ? remaining
        : money(req.body.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > remaining
    ) {
      throw fail(
        400,
        "Refund amount exceeds the refundable order balance."
      );
    }

    order.refundPendingAmount = money(
      (order.refundPendingAmount || 0) + amount
    );

    await order.save({
      session,
    });

    [createdRefund] = await Refund.create(
      [
        {
          order: order._id,
          user: order.user,
          provider: order.paymentProvider,
          providerPaymentId,
          amount,
          currency: order.currency,
          reason,
          destination: order.paymentProvider === "wallet" ? "wallet" : destination,
          customerExplanation: explanation?.trim(),
          evidenceImages,
          requestedBy: req.userId,
          requestedByRole: "Customer",
        },
      ],
      {
        session,
      },
    );
  });

  res.status(201).json(createdRefund);
});


const getRefunds = asyncHandler(async (req, res) => {
  const {
    limit,
    skip,
  } = pagination(req);

  const query = {};

  if (req.query.orderId !== undefined) {
    query.order = requireId(req.query.orderId);
  }

  if (req.query.status !== undefined) {
    if (
      typeof req.query.status !== "string" ||
      ![
        "requested",
        "processing",
        "succeeded",
        "failed",
        "rejected",
      ].includes(req.query.status)
    ) {
      throw fail(400, "Invalid refund status.");
    }

    query.status = req.query.status;
  }

  const refunds = await Refund.find(query)
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  res.json(refunds);
});



const getRefund = asyncHandler(async (req, res) => {
  const refund = await Refund.findById(requireId(req.params.id));

  if (!refund) {
    throw fail(404, "Refund not found.");
  }

  res.json(refund);
});

const getUserRefunds = asyncHandler(async (req, res) => {
  const {
    limit,
    skip,
  } = pagination(req);

  const refunds = await Refund.find({
    user: req.userId,
  })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  res.json(refunds);
});


const approveRefund = asyncHandler(async (req, res) => {
  const refund = await processRefund(
    requireId(req.params.id),
    req.userId,
  );

  res.json(refund);
});


const rejectRefund = asyncHandler(async (req, res) => {
  const refundId = requireId(req.params.id);
  const reason = req.body.reason;

  if (
    typeof reason !== "string" ||
    !reason.trim() ||
    reason.length > 1000
  ) {
    throw fail(
      400,
      "Rejection reason must contain 1–1000 characters."
    );
  }

  let rejected;

  await mongoose.connection.transaction(async (session) => {
    const refund = await Refund.findOne({
      _id: refundId,
      status: "requested",
    }).session(session);

    if (!refund) {
      throw fail(
        409,
        "Only requested refunds can be rejected."
      );
    }

    const order = await Order.findById(
      refund.order
    ).session(session);

    if (!order) {
      throw fail(404, "Order not found.");
    }

    order.refundPendingAmount = Math.max(
      0,
      money(
        (order.refundPendingAmount || 0) - refund.amount
      )
    );

    refund.status = "rejected";
    refund.rejectedBy = req.userId;
    refund.rejectionReason = reason.trim();
    refund.processedAt = new Date();

    await order.save({
      session,
    });
    await refund.save({
      session,
    });

    rejected = refund;
  });

  res.json(rejected);
});


module.exports = {
  requestRefund,
  getRefunds,
  getRefund,
  getUserRefunds,
  approveRefund,
  rejectRefund,
};
