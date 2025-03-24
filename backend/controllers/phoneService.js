const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const createMessage = async (req, res) => {
  try {
    const { body, to } = req.body;

    if (!body || !to) {
      return res
        .status(400)
        .json({ error: "Message body and recipient number are required." });
    }

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // Make sure to set this in your .env file
      to,
    });

    return res
      .status(200)
      .json({ message: "Message sent successfully!", sid: message.sid });
  } catch (error) {
    console.error("Error sending message:", error);
    return res
      .status(500)
      .json({ error: "Failed to send message", details: error.message });
  }
};

module.exports = { createMessage };
