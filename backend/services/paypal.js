const {
  Client,
  Environment,
  OrdersController,
} = require("@paypal/paypal-server-sdk");
const { fail } = require("../utils/http");

let cached;

function environmentName() {
  const value = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  if (!["sandbox", "live", "production"].includes(value)) {
    throw fail(503, "PAYPAL_ENVIRONMENT must be sandbox or live.");
  }
  return value === "sandbox" ? "sandbox" : "production";
}

function getPayPal() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw fail(503, "PayPal is not configured on the server.");
  }

  const environment = environmentName();
  const cacheKey = `${environment}:${clientId}`;
  if (cached?.key === cacheKey) return cached.value;

  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    environment:
      environment === "sandbox" ? Environment.Sandbox : Environment.Production,
    timeout: 15000,
  });

  cached = {
    key: cacheKey,
    value: {
      client,
      orders: new OrdersController(client),
      apiBaseUrl:
        environment === "sandbox"
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com",
    },
  };
  return cached.value;
}

module.exports = getPayPal;
