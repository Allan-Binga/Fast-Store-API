import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const session = stripe.checkout.sessions.create({
      line_items: [{ price: req.body.price, quantity: req.body.quantity || 1 }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message || error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session." });
  }
};
