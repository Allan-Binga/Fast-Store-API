const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/orders");
const Cart = require("../models/cart");
const User = require("../models/users")
const { sendOrderConfirmationEmail } = require("../controllers/emailService");

const handleWebhook = async (req, res) => {
  const endpointSecret = process.env.WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;
  let userId;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send("Webhook Error");
  }

  switch (event.type) {
    case "payment_intent.payment_failed":
      const session = event.data.object;
      userId = session.metadata?.user; // Get userId from metadata
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
      userId = completedSession.metadata?.user;

      try {
        const completedOrder = await Order.findById(completedOrderId);
        if (!completedOrder) {
          console.error("Order not found:", completedOrderId);
          return;
        }

        // Update order status
        completedOrder.paymentStatus = completedSession.payment_status;
        await completedOrder.save();

        // Fetch user email
        const user = await User.findById(userId);
        if (user && user.email) {
          await sendOrderConfirmationEmail(user.email, completedOrder);
          console.log(`Order confirmation email sent to ${user.email}`);
        } else {
          console.warn("User email not found, order confirmation not sent.");
        }

        // Clear the cart only if we have a userId
        if (userId) {
          await Cart.findOneAndDelete({ userId });
          console.log(`Cart cleared for user: ${userId}`);
        } else {
          console.warn("No userId found, cart not cleared.");
        }

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
