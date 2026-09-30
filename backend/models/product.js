const mongoose = require("mongoose");


const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      select: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },
    reorderPoint: {
      type: Number,
      default: 5,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Reorder point must be a whole number.",
      },
    },
    reorderQuantity: {
      type: Number,
      default: 10,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Reorder quantity must be a positive whole number.",
      },
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (images) =>
          images.length >= 1 &&
          images.length <= 4 &&
          images.every(
            (image) =>
              typeof image === "string" &&
              image.trim()
          ),
        message: "Products require between 1 and 4 valid image URLs.",
      },
    },
    reviews: {
      rate: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        required: true,
        min: 0,
        validate: {
          validator: Number.isInteger,
          message: "Review count must be a whole number.",
        },
      },
    },
    newArrival: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);


// Hydrate products created before the image gallery migration.
ProductSchema.pre("init", function migrateLegacyImage(document) {
  if (
    (!Array.isArray(document.images) || !document.images.length) &&
    typeof document.image === "string" &&
    document.image.trim()
  ) {
    document.images = [document.image];
  }
});


ProductSchema.virtual("image").get(function primaryImage() {
  return this.images?.[0];
});


ProductSchema.index({
  name: "text",
  description: "text",
});
ProductSchema.index(
  {
    name: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "Product",
  ProductSchema
);
