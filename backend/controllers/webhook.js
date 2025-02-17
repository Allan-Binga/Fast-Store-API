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
      const paymentIntent = event.data.object;
      try {
        // Extract necessary data from the payment intent
        const { id: paymentId, amount, currency } = paymentIntent;
        const { customer: userId } = paymentIntent.metadata; // Assuming you've stored user ID in metadata

        // Create an order
        const newOrder = new Order({
          user: userId,
          items: paymentIntent.metadata.items ? JSON.parse(paymentIntent.metadata.items) : [], // Assuming items are stored as JSON string
          totalAmount: amount / 100, // Stripe uses cents, so convert to dollars or your currency's smallest unit
          currency: currency,
          paymentStatus: "completed",
        });

        await newOrder.save();
        console.log("Order created:", newOrder._id);
      } catch (error) {
        console.error("Failed to create order:", error.message);
      }
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object.id);
      break;

    case "checkout.session.completed":
      console.log("Checkout completed:", event.data.object.id);
      // If you also want to handle order creation from checkout session, you can do so here similar to payment_intent.succeeded
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received.");
};

module.exports = { handleWebhook };