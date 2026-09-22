const mongoose = require("mongoose");

// Secrets are excluded from ordinary queries and all serialized user documents.
const secretFields = ["password", "refreshTokenHash", "sessionId", "verificationToken", "verificationTokenExpiry", "passwordResetToken", "passwordResetTokenExpiry"];
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["Customer", "Admin"], default: "Customer" },
  // The single default-address pointer avoids competing default flags.
  defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  isVerified: { type: Boolean, default: false },
  refreshTokenHash: { type: String, select: false },
  sessionId: { type: String, select: false },
  verificationToken: { type: String, select: false },
  verificationTokenExpiry: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpiry: { type: Date, select: false },
}, { timestamps: true, toJSON: { transform(_doc, ret) { for (const field of secretFields) delete ret[field]; return ret; } } });
module.exports = mongoose.model("User", userSchema);
