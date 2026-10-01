const Product = require("../models/product");
const InventoryMovement = require("../models/inventoryMovement");
const {
  asyncHandler,
  fail,
  requireId,
  pagination,
} = require("../utils/http");


const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, skip } = pagination(req);

  res.json(
    await Product.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
  );
});

const getLimitedProducts = getAllProducts;

const getNewArrivals = asyncHandler(async (req, res) => {
  res.json(
    await Product.find({
      newArrival: true,
      quantity: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .limit(10)
  );
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    requireId(req.params.id)
  );

  if (!product) {
    throw fail(404, "Product not found.");
  }

  res.json(product);
});



const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    requireId(req.params.id)
  ).select("+costPrice");

  if (!product) {
    throw fail(404, "Product not found.");
  }

  res.json(product);
});

const searchResults = asyncHandler(async (req, res) => {
  if (
    typeof req.query.q !== "string" ||
    !req.query.q.trim() ||
    req.query.q.length > 200
  ) {
    throw fail(
      400,
      "Provide a search query of 1–200 characters."
    );
  }

  const { limit, skip } = pagination(req);

  if (req.query.suggest === "true") {
    const escaped = req.query.q
      .trim()
      .replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");

    return res.json(
      await Product.find({
        name: new RegExp(escaped, "i"),
      })
        .sort({ name: 1, _id: 1 })
        .limit(Math.min(limit, 5))
    );
  }

  res.json(
    await Product.find({
      $text: {
        $search: req.query.q.trim(),
      },
    })
      .skip(skip)
      .limit(limit)
  );
});


// -----------------------------------------------------------------------------
// Product input
// -----------------------------------------------------------------------------

const productFields = [
  "name",
  "currentPrice",
  "originalPrice",
  "costPrice",
  "category",
  "quantity",
  "reorderPoint",
  "reorderQuantity",
  "description",
  "images",
  "reviews",
  "newArrival",
];

const numberFromFormData = (value) => {
  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    return Number(value);
  }

  return value;
};

const categoriesFromFormData = (value) => {
  if (Array.isArray(value)) {
    return value.map((category) => category.trim());
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      throw fail(
        400,
        "Category must be repeated form-data fields or a JSON array."
      );
    }
  }

  return [trimmed];
};

const reviewsFromFormData = (body) => {
  let reviews = body.reviews;

  if (typeof reviews === "string") {
    try {
      reviews = JSON.parse(reviews);
    } catch {
      throw fail(
        400,
        "Reviews must be valid JSON or use reviews.rate and reviews.count."
      );
    }
  }

  if (
    body["reviews.rate"] !== undefined ||
    body["reviews.count"] !== undefined
  ) {
    reviews = {
      ...(reviews && typeof reviews === "object" ? reviews : {}),
      ...(body["reviews.rate"] !== undefined
        ? { rate: body["reviews.rate"] }
        : {}),
      ...(body["reviews.count"] !== undefined
        ? { count: body["reviews.count"] }
        : {}),
    };
  }

  if (!reviews || typeof reviews !== "object" || Array.isArray(reviews)) {
    return reviews;
  }

  return {
    rate: numberFromFormData(reviews.rate),
    count: numberFromFormData(reviews.count),
  };
};

const normalizeProductBody = (body = {}) => {
  const normalized = {
    ...body,
  };

  delete normalized["reviews.rate"];
  delete normalized["reviews.count"];

  if (body.category !== undefined) {
    normalized.category = categoriesFromFormData(body.category);
  }

  for (const field of [
    "currentPrice",
    "originalPrice",
    "costPrice",
    "quantity",
    "reorderPoint",
    "reorderQuantity",
  ]) {
    if (body[field] !== undefined) {
      normalized[field] = numberFromFormData(body[field]);
    }
  }

  if (
    body.reviews !== undefined ||
    body["reviews.rate"] !== undefined ||
    body["reviews.count"] !== undefined
  ) {
    normalized.reviews = reviewsFromFormData(body);
  }

  if (typeof body.newArrival === "string") {
    if (!["true", "false"].includes(body.newArrival.toLowerCase())) {
      throw fail(400, "newArrival must be true or false.");
    }

    normalized.newArrival =
      body.newArrival.toLowerCase() === "true";
  }

  return normalized;
};

const productData = (body, existing = {}) => {
  const unknownField = Object.keys(body).find(
    (key) => !productFields.includes(key)
  );

  if (unknownField) {
    throw fail(
      400,
      "Unknown product field: " + unknownField + "."
    );
  }

  const data = {
    ...existing,
    ...body,
  };

  if (
    ![data.name, data.description].every(
      (value) => typeof value === "string" && value.trim()
    ) ||
    !Array.isArray(data.category) ||
    !data.category.length ||
    data.category.some(
      (value) => typeof value !== "string" || !value.trim()
    )
  ) {
    throw fail(
      400,
      "Valid product name, description and categories are required."
    );
  }

  if (
    !Array.isArray(data.images) ||
    data.images.length === 0 ||
    data.images.length > 4 ||
    data.images.some(
      (image) => typeof image !== "string" || !image.trim()
    )
  ) {
    throw fail(
      400,
      "Between 1 and 4 valid product images are required."
    );
  }

  if (
    ![
      data.currentPrice,
      data.originalPrice,
      data.costPrice,
    ].every(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0
    ) ||
    data.currentPrice > data.originalPrice
  ) {
    throw fail(
      400,
      "Invalid selling, original or cost price."
    );
  }

  if (
    !Number.isInteger(data.quantity) ||
    data.quantity < 0
  ) {
    throw fail(
      400,
      "Stock must be a non-negative integer."
    );
  }

  if (
    data.reorderPoint !== undefined &&
    (
      !Number.isInteger(data.reorderPoint) ||
      data.reorderPoint < 0
    )
  ) {
    throw fail(
      400,
      "Reorder point must be a non-negative integer."
    );
  }

  if (
    data.reorderQuantity !== undefined &&
    (
      !Number.isInteger(data.reorderQuantity) ||
      data.reorderQuantity < 1
    )
  ) {
    throw fail(
      400,
      "Reorder quantity must be a positive integer."
    );
  }

  if (
    !data.reviews ||
    typeof data.reviews !== "object" ||
    !Number.isFinite(data.reviews.rate) ||
    data.reviews.rate < 0 ||
    data.reviews.rate > 5 ||
    !Number.isInteger(data.reviews.count) ||
    data.reviews.count < 0
  ) {
    throw fail(
      400,
      "Reviews require a rate from 0 to 5 and a non-negative integer count."
    );
  }

  if (
    data.newArrival !== undefined &&
    typeof data.newArrival !== "boolean"
  ) {
    throw fail(400, "newArrival must be true or false.");
  }

  data.name = data.name.trim();
  data.description = data.description.trim();
  data.category = data.category.map(
    (category) => category.trim()
  );
  data.images = data.images.map(
    (image) => image.trim()
  );

  data.discount =
    data.originalPrice === 0
      ? 0
      : Math.round(
        (1 - data.currentPrice / data.originalPrice) * 100
      );

  return data;
};

const uploadedImageUrls = (files = []) =>
  files.map((file) => file.location || file.path);


const addNewProduct = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw fail(400, "Please upload at least one product image.");
  }

  const data = productData({
    ...normalizeProductBody(req.body),
    images: uploadedImageUrls(req.files),
  });

  if (await Product.findOne({ name: data.name })) {
    throw fail(409, "Product already exists.");
  }

  const product = await Product.create({
    ...data,
    newArrival: data.newArrival ?? true,
  });

  if (product.quantity > 0) {
    await InventoryMovement.create({
      product: product._id,
      type: "initial_stock",
      quantityChange: product.quantity,
      quantityBefore: 0,
      quantityAfter: product.quantity,
      reason: "Initial product stock",
      performedBy: req.userId,
    });
  }

  res.status(201).json(product);
});


const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    requireId(req.params.id)
  ).select("+costPrice");

  if (!product) {
    throw fail(404, "Product not found.");
  }

  const existing = Object.fromEntries(
    productFields.map(
      (key) => [key, product[key]]
    )
  );

  const uploadedImages = uploadedImageUrls(req.files);
  const changes = normalizeProductBody(req.body);
  const previousQuantity = product.quantity;

  if (uploadedImages.length) {
    changes.images = uploadedImages;
  }

  Object.assign(
    product,
    productData(changes, existing)
  );

  await product.save();

  const quantityChange = product.quantity - previousQuantity;

  if (quantityChange !== 0) {
    await InventoryMovement.create({
      product: product._id,
      type: quantityChange > 0 ? "restock" : "manual_adjustment",
      quantityChange,
      quantityBefore: previousQuantity,
      quantityAfter: product.quantity,
      reason: "Quantity changed while editing product",
      performedBy: req.userId,
    });
  }

  res.json(product);
});


const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(
    requireId(req.params.id)
  );

  if (!product) {
    throw fail(404, "Product not found.");
  }

  await Promise.all([
    require("../models/brand").updateMany(
      {},
      { $pull: { products: product._id } }
    ),

    require("../models/promo").deleteMany({
      product: product._id,
    }),

    require("../models/flashsale").deleteOne({
      _id: product._id,
    }),

    require("../models/cart").updateMany(
      {},
      {
        $pull: {
          products: {
            productId: product._id,
          },
        },
      }
    ),

    require("../models/wishlist").updateMany(
      {},
      {
        $pull: {
          products: {
            productId: product._id,
          },
        },
      }
    ),
  ]);

  res.json({
    message: "Product deleted.",
  });
});


module.exports = {
  getAllProducts,
  getLimitedProducts,
  getNewArrivals,
  getSingleProduct,
  getAdminProduct,
  searchResults,
  addNewProduct,
  updateProduct,
  deleteProduct,
};
