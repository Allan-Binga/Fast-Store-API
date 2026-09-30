const { asyncHandler, fail } = require("../utils/http");
const { settleOrder, settlePayPalOrder } = require("../services/orders");
const { confirmOrder } = require("../services/confirmation");
const getStripe = require("../services/stripe");
const getPayPal = require("../services/paypal");
const {
  syncProviderRefund,
} = require("../services/refunds");

function queueConfirmation(orderId) {
  setImmediate(async () => {
    try {
      await confirmOrder(orderId);
    } catch (error) {
      // The reconciliation worker retries paid orders whose email is unsent.
      console.error(
        "Order confirmation delivery deferred:",
        String(orderId),
        error.message,
      );
    }
  });
}

// Verify raw payloads and acknowledge as soon as durable payment processing finishes.
const handleWebhook = asyncHandler(async (req, res) => {
  if (!process.env.WEBHOOK_SECRET) {
    throw fail(503, "Webhook is not configured.");
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.WEBHOOK_SECRET,
    );
  } catch {
    throw fail(400, "Invalid webhook signature.");
  }

  if (
    [
      "refund.created",
      "refund.updated",
      "refund.failed",
    ].includes(event.type)
  ) {
    const refund = event.data.object;

    await syncProviderRefund({
      provider: "stripe",
      providerRefundId: refund.id,
      internalRefundId: refund.metadata?.refundId,
      status:
        event.type === "refund.failed"
          ? "failed"
          : refund.status,
      failureReason: refund.failure_reason,
    });

    return res.json({
      received: true,
    });
  }

  if (
    !["checkout.session.completed", "checkout.session.expired"].includes(
      event.type,
    )
  ) {
    return res.json({ received: true });
  }

  const data = event.data.object;
  if (!data.metadata?.orderId || !data.metadata?.user) {
    return res.json({ received: true });
  }

  const order = await settleOrder(data);

  // Stripe only waits for durable payment and inventory processing.
  res.json({ received: true });

  if (order.paymentStatus === "paid" && !order.confirmationSent) {
    queueConfirmation(order._id);
  }
});

async function verifyPayPalSignature(req) {
  if (!process.env.PAYPAL_WEBHOOK_ID) {
    throw fail(503, "PayPal webhook verification is not configured.");
  }

  const transmissionId = req.get("paypal-transmission-id");
  const transmissionTime = req.get("paypal-transmission-time");
  const certificateUrl = req.get("paypal-cert-url");
  const algorithm = req.get("paypal-auth-algo");
  const signature = req.get("paypal-transmission-sig");
  if (!transmissionId || !transmissionTime || !certificateUrl || !algorithm || !signature) {
    throw fail(400, "Missing PayPal webhook signature headers.");
  }

  const { client, apiBaseUrl } = getPayPal();
  const token = await client.clientCredentialsAuthManager.fetchToken();
  const response = await fetch(`${apiBaseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certificateUrl,
      auth_algo: algorithm,
      transmission_sig: signature,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: req.body,
    }),
  });
  if (!response.ok) throw fail(503, "PayPal webhook verification is unavailable.");
  const result = await response.json();
  if (result.verification_status !== "SUCCESS") {
    throw fail(400, "Invalid PayPal webhook signature.");
  }
}

const handlePayPalWebhook = asyncHandler(async (req, res) => {
  await verifyPayPalSignature(req);
  const event = req.body;
  if (!event || typeof event.event_type !== "string") {
    throw fail(400, "Invalid PayPal webhook payload.");
  }

  const supported = [
    "CHECKOUT.ORDER.COMPLETED",
    "PAYMENT.CAPTURE.COMPLETED",
    "PAYMENT.CAPTURE.REFUNDED",
  ];
  if (!supported.includes(event.event_type)) {
    return res.json({ received: true });
  }

  if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    await syncProviderRefund({
      provider: "paypal",
      providerRefundId: event.resource?.id,
      internalRefundId: event.resource?.custom_id,
      status: event.resource?.status || "COMPLETED",
    });

    return res.json({
      received: true,
    });
  }

  const paypalOrderId =
    event.event_type === "CHECKOUT.ORDER.COMPLETED"
      ? event.resource?.id
      : event.resource?.supplementary_data?.related_ids?.order_id;
  if (!paypalOrderId) return res.json({ received: true });

  const response = await getPayPal().orders.getOrder({ id: paypalOrderId });
  const order = await settlePayPalOrder(response.result);
  res.json({ received: true });

  if (!order.confirmationSent) queueConfirmation(order._id);
});

module.exports = { handleWebhook, handlePayPalWebhook };
