const mongoose = require("mongoose");

//USERS SCHEMA
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      // unique: true,
    },
    lastName: {
      type: String,
      required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpiry: { type: Date },
  },
  {
    timestamps: false,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
