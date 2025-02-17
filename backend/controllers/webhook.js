const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleWebhook = async (req, res) => {
  const endpointSecret = process.env.WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error("Webhook signature cerification failed:", error.message);
    return res.status(400).send(`Webhook Error`);
  }

  //Switch case for different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment successful:", paymentIntent.id);
      break;

    case "payment_intent.payment_failed":
      const paymentFailed = event.data.object;
      console.log("Payment failed:", paymentFailed.id);
      break;
    case "checkout_session.completed":
      const session = event.data.object;
      console.log("Checkout completed:", session.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received.");
};

module.exports = { handleWebhook };
