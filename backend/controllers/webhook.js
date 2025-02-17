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
      console.log("Payment successful:", event.data.object.id);
      break;
  
    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object.id);
      break;
  
    case "checkout.session.completed":
      console.log("Checkout completed:", event.data.object.id);
      break;
  
    case "charge.succeeded":
      console.log("Charge successful:", event.data.object.id);
      break;
  
    case "charge.failed":
      console.log("Charge failed:", event.data.object.id);
      break;
  
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  

  res.status(200).send("Webhook received.");
};

module.exports = { handleWebhook };
