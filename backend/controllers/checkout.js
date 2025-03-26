const dotenv = require("dotenv");
const Stripe = require("stripe");
const Order = require("../models/orders"); // Import your Order model

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const userId = req.userId;

  try {
    const { items } = req.body;

    // Store order in DB first
    const newOrder = new Order({
      user: userId,
      items: items,
      totalAmount: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      currency: "usd",
      paymentStatus: "pending",
    });

    await newOrder.save(); // Save order in database

    // Create line items dynamically
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const stripeProduct = await stripe.products.create({
          name: item.name,
          description: item.description,
          images: item.image ? [item.image] : [],
        });

        const priceObject = await stripe.prices.create({
          unit_amount: item.price * 100,
          currency: "usd",
          product: stripeProduct.id,
        });

        return {
          price: priceObject.id,
          quantity: item.quantity || 1,
        };
      })
    );

    // Create the checkout session with only orderId in metadata
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/faststore/cart`,
      metadata: {
        orderId: newOrder._id.toString(), // Store only orderId
        user: String(userId),
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message || error);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
};

module.exports = { createCheckoutSession };
