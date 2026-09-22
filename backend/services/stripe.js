const Stripe = require("stripe");
const { fail } = require("../utils/http");
// Optional payment credentials are required only when payment endpoints are used.
module.exports = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw fail(503, "Payments are not configured.");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
