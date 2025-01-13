const mongoose = require("mongoose");

const oauthSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const OAuthUser = mongoose.model("OauthUser", oauthSchema);
module.exports = OAuthUser;
