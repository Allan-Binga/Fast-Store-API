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
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", BrandSchema);
module.exports = Brand;
