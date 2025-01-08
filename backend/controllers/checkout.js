import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body; // Expecting an array of items (from frontend)

    // Create line items dynamically
    const lineItems = await Promise.all(
      items.map(async (item) => {
        // Dynamically create a product for each item
        const stripeProduct = await stripe.products.create({
          name: item.title, // Use 'title' from the frontend
          description: item.description, // Use 'description' from the frontend
          images: item.image ? [item.image] : [], // Add 'image' from the frontend
        });

        // Create a price object for each product
        const priceObject = await stripe.prices.create({
          unit_amount: item.price * 100, // Convert to cents
          currency: "usd", // Replace with your desired currency
          product: stripeProduct.id,
        });

        // Return the line item for this product
        return {
          price: priceObject.id,
          quantity: item.quantity || 1,
        };
      })
    );

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/faststore/cart`,
    });

    // Send the session URL and session ID to the frontend
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message || error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session." });
  }
};
