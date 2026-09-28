const fetch = require("node-fetch");

const ENVIRONMENTS = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
};

function requireConfig(key) {
  const value = String(process.env[key] || "").trim();
  if (!value || value.toUpperCase() === "N/A") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function baseUrl() {
  const environment = (process.env.DARAJA_ENVIRONMENT || "sandbox").toLowerCase();
  return ENVIRONMENTS[environment] || ENVIRONMENTS.sandbox;
}

function timestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

async function accessToken() {
  const consumerKey = requireConfig("DARAJA_CONSUMER_KEY");
  const consumerSecret = requireConfig("DARAJA_CONSUMER_SECRET");
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(body.errorMessage || body.error || "Daraja authentication failed.");
  }
  return body.access_token;
}

async function stkPush({
  amount,
  phoneNumber,
  accountReference,
  transactionDesc,
  callbackUrl,
}) {
  const shortCode = requireConfig("MPESA_SHORTCODE");
  const passkey = requireConfig("MPESA_PASSKEY");
  const generatedAt = timestamp();
  const token = await accessToken();
  const password = Buffer.from(`${shortCode}${passkey}${generatedAt}`).toString("base64");
  const response = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: generatedAt,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ResponseCode !== "0") {
    throw new Error(body.errorMessage || body.ResponseDescription || "M-Pesa prompt failed.");
  }
  return body;
}

module.exports = { stkPush };
