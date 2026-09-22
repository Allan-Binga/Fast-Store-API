const { asyncHandler, fail } = require("../utils/http");
const { settleOrder } = require("../services/orders");
const { confirmOrder } = require("../services/confirmation");
const getStripe = require("../services/stripe");

// Verify raw payloads and acknowledge only after durable order processing.
const handleWebhook = asyncHandler(async (req, res) => {
  if (!process.env.WEBHOOK_SECRET) throw fail(503, "Webhook is not configured.");
  let event;
  try { event = getStripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.WEBHOOK_SECRET); }
  catch { throw fail(400, "Invalid webhook signature."); }
  if (!["checkout.session.completed", "checkout.session.expired"].includes(event.type)) return res.json({ received: true });
  const data = event.data.object;
  if (!data.metadata?.orderId || !data.metadata?.user) return res.json({ received: true });
  const order = await settleOrder(data);
  // Mail failure retries the event without repeating stock or cart mutations.
  if (order.paymentStatus === "paid" && !order.confirmationSent) await confirmOrder(order._id);
  res.json({ received: true });
});
module.exports = { handleWebhook };
