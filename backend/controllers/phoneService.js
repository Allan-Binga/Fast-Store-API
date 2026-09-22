const twilio = require("twilio");
const { asyncHandler, fail } = require("../utils/http");

// SMS is restricted by the route to administrators and initialized on demand.
const createMessage = asyncHandler(async (req, res) => {
  const { body, to } = req.body;
  if (typeof body !== "string" || !body.trim() || body.length > 1600 || typeof to !== "string" || !/^\+[1-9]\d{7,14}$/.test(to)) throw fail(400, "Provide a valid message and international phone number.");
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) throw fail(503, "SMS service is not configured.");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const message = await client.messages.create({ body, to, from: process.env.TWILIO_PHONE_NUMBER });
  res.json({ message: "Message sent.", sid: message.sid });
});
module.exports = { createMessage };
