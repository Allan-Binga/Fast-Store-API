const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orders");

const handleWebhook = async (req, res) => {
  const endpointSecret = process.env.WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send("Webhook Error");
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      // console.log("Payment succeeded.");
      break;

    case "payment_intent.payment_failed":
      // console.log("Payment failed.");

      const session = event.data.object;
      const userId = session.metadata?.user; // Get userId from metadata
      const orderId = session.metadata?.orderId; // Get orderId if available

      try {
        let order;

        if (orderId) {
          // If the order already exists, update it
          order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = "Failed";
            await order.save();
          }
        } else {
          // If no order exists, create a new one
          order = new Order({
            user: userId,
            items: [], // Since we don’t have `items` in metadata, we can't save them
            totalAmount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            paymentStatus: "Failed",
          });
          await order.save();
        }

        // console.log("Order marked as 'Failed'.");
      } catch (error) {
        console.error("Failed to handle failed payment:", error.message);
      }
      break;

    case "checkout.session.completed":
      const completedSession = event.data.object;
      const completedOrderId = completedSession.metadata.orderId;

      try {
        const completedOrder = await Order.findById(completedOrderId);
        if (!completedOrder) {
          console.error("Order not found:", completedOrderId);
          return;
        }

        // Update order status
        completedOrder.paymentStatus = completedSession.payment_status;
        await completedOrder.save();

        // console.log("Order updated successfully.");
      } catch (error) {
        console.error("Failed to update order:", error.message);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received.");
};

module.exports = { handleWebhook };
