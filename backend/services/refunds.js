const mongoose = require("mongoose");

const Refund = require("../models/refund");
const Order = require("../models/orders");
const PaymentTransaction = require("../models/paymentTransaction");
const getStripe = require("./stripe");
const getPayPal = require("./paypal");
const {
  fail,
} = require("../utils/http");


const money = (value) =>
  Math.round(Number(value) * 100) / 100;

const providerStatus = (provider, status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    (provider === "stripe" && normalized === "succeeded") ||
    (provider === "paypal" && normalized === "completed")
  ) {
    return "succeeded";
  }

  if (
    ["failed", "cancelled", "canceled"].includes(normalized)
  ) {
    return "failed";
  }

  return "processing";
};


const refundStripe = async (refund) => {
  const result = await getStripe().refunds.create(
    {
      payment_intent: refund.providerPaymentId,
      amount: Math.round(refund.amount * 100),
      reason:
        refund.reason === "fraudulent"
          ? "fraudulent"
          : "requested_by_customer",
      metadata: {
        refundId: String(refund._id),
        orderId: String(refund.order),
      },
    },
    {
      idempotencyKey: "faststore-refund-" + refund._id,
    },
  );

  return {
    id: result.id,
    status: providerStatus("stripe", result.status),
    rawStatus: result.status,
  };
};


const refundPayPal = async (refund) => {
  const {
    client,
    apiBaseUrl,
  } = getPayPal();

  const token = await client
    .clientCredentialsAuthManager
    .fetchToken();

  const response = await fetch(
    apiBaseUrl +
      "/v2/payments/captures/" +
      encodeURIComponent(refund.providerPaymentId) +
      "/refund",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token.accessToken,
        "Content-Type": "application/json",
        "PayPal-Request-Id":
          "faststore-refund-" + refund._id,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        amount: {
          value: refund.amount.toFixed(2),
          currency_code: refund.currency.toUpperCase(),
        },
        custom_id: String(refund._id),
        note_to_payer: refund.reason.replaceAll("_", " "),
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const description =
      result.details?.[0]?.description ||
      result.message ||
      "PayPal could not process the refund.";

    throw fail(
      response.status >= 500 ? 503 : 409,
      description
    );
  }

  return {
    id: result.id,
    status: providerStatus("paypal", result.status),
    rawStatus: result.status,
  };
};


const finalizeRefund = async ({
  refundId,
  providerRefundId,
  status,
  rawStatus,
  failureReason,
}) => {
  let finalized;

  await mongoose.connection.transaction(async (session) => {
    const refund = await Refund.findById(refundId).session(session);

    if (!refund) {
      throw fail(404, "Refund not found.");
    }

    if (
      ["succeeded", "failed", "rejected"].includes(refund.status)
    ) {
      finalized = refund;
      return;
    }

    const order = await Order.findById(refund.order).session(session);

    if (!order) {
      throw fail(404, "Order not found.");
    }

    if (providerRefundId) {
      refund.providerRefundId = providerRefundId;
    }

    if (status === "succeeded") {
      const amount = money(refund.amount);

      order.refundPendingAmount = Math.max(
        0,
        money((order.refundPendingAmount || 0) - amount)
      );
      order.refundedAmount = money(
        (order.refundedAmount || 0) + amount
      );
      order.paymentStatus =
        order.refundedAmount >= money(order.totalAmount)
          ? "refunded"
          : "partially_refunded";

      refund.status = "succeeded";
      refund.processedAt = new Date();
      refund.failureReason = undefined;

      if (refund.destination === "wallet" || refund.provider === "wallet") {
        const Entry = require("../models/walletEntry");
        const [entry] = await Entry.create([{ user: refund.user, key: `refund:${refund._id}`, type: "refund", provider: "wallet", amountCents: Math.round(amount * 100), currency: refund.currency }], { session });
        await require("./wallet").creditEntry(entry, session);
      }
      await PaymentTransaction.updateOne(
        {
          provider: refund.destination === "wallet" ? "wallet" : refund.provider,
          type: "refund",
          providerTransactionId:
            providerRefundId || String(refund._id),
        },
        {
          $setOnInsert: {
            order: order._id,
            user: order.user,
            provider: refund.destination === "wallet" ? "wallet" : refund.provider,
            type: "refund",
            providerTransactionId:
              providerRefundId || String(refund._id),
            amount,
            currency: refund.currency,
            status: "succeeded",
            occurredAt: refund.processedAt,
            metadata: {
              refundId: String(refund._id),
              providerStatus: rawStatus,
            },
          },
        },
        {
          upsert: true,
          session,
        },
      );
    } else if (status === "failed") {
      order.refundPendingAmount = Math.max(
        0,
        money(
          (order.refundPendingAmount || 0) - refund.amount
        )
      );
      refund.status = "failed";
      refund.failureReason =
        failureReason || "The payment provider rejected the refund.";
      refund.processedAt = new Date();
    } else {
      refund.status = "processing";
    }

    await order.save({
      session,
    });
    await refund.save({
      session,
    });

    finalized = refund;
  });

  return finalized;
};


const processRefund = async (refundId, administratorId) => {
  const refund = await Refund.findOneAndUpdate(
    {
      _id: refundId,
      status: {
        $in: ["requested", "processing"],
      },
    },
    {
      $set: {
        status: "processing",
        approvedBy: administratorId,
      },
    },
    {
      new: true,
    },
  );

  if (!refund) {
    const existing = await Refund.findById(refundId);

    if (!existing) {
      throw fail(404, "Refund not found.");
    }

    if (existing.status === "succeeded") {
      return existing;
    }

    throw fail(
      409,
      "This refund can no longer be approved."
    );
  }

  if (refund.destination === "wallet" || refund.provider === "wallet") return finalizeRefund({ refundId: refund._id, status: "succeeded", rawStatus: "wallet_credit" });

  let result;

  try {
    result =
      refund.provider === "stripe"
        ? await refundStripe(refund)
        : await refundPayPal(refund);
  } catch (error) {
    await Refund.updateOne(
      {
        _id: refund._id,
        status: "processing",
      },
      {
        $set: {
          failureReason:
            "Provider result is not confirmed. Retry approval safely.",
        },
      },
    );

    throw error;
  }

  return finalizeRefund({
    refundId: refund._id,
    providerRefundId: result.id,
    status: result.status,
    rawStatus: result.rawStatus,
  });
};


const syncProviderRefund = async ({
  provider,
  providerRefundId,
  internalRefundId,
  status,
  failureReason,
}) => {
  const refund = await Refund.findOne({
    $or: [
      ...(providerRefundId
        ? [{ providerRefundId }]
        : []),
      ...(internalRefundId &&
      mongoose.isValidObjectId(internalRefundId)
        ? [{ _id: internalRefundId }]
        : []),
    ],
    provider,
  });

  if (!refund) {
    return null;
  }

  return finalizeRefund({
    refundId: refund._id,
    providerRefundId:
      providerRefundId || refund.providerRefundId,
    status: providerStatus(provider, status),
    rawStatus: status,
    failureReason,
  });
};


module.exports = {
  processRefund,
  syncProviderRefund,
};
