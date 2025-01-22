const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    slogan: {
      type: String,
      maxlength: [100, "Slogan cannot exceed 100 characters"],
      required: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", BrandSchema);
module.exports = Brand;
