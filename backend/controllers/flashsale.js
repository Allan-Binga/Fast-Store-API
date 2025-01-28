const FlashSale = require("../models/flashsale");
const Product = require("../models/product");
const moment = require("moment");

//GETTING FLASHSALE PRODUCTS
const getFlashSaleProducts = async (_req, res) => {
  try {
    const flashSaleProducts = await FlashSale.find();
    res.status(200).json(flashSaleProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch limited products." });
  }
};

//ADDING PRODUCTS TO FLASHSALE
const addProductToFlashSale = async (req, res) => {
  try {
    // Destructure the request body according to the model's schema
    const {
      productId,
      name,
      currentPrice,
      originalPrice,
      discount,
      category,
      description,
      image,
      reviews,
      startTime,
      endTime,
      quantityAvailable,
    } = req.body;

    // Validate all required fields
    if (
      !productId ||
      !name ||
      !currentPrice ||
      !originalPrice ||
      !category ||
      !description ||
      !image ||
      !reviews?.rate ||
      !reviews?.count ||
      !startTime ||
      !endTime ||
      !quantityAvailable
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate product existence
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Product does not exist." });
    }

    // Parse dates if they come in ISO format (as in your example)
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format for start or end time." });
    }

    // Create a new flash sale product
    const newFlashSaleProduct = new FlashSale({
      productId,
      name,
      currentPrice,
      originalPrice,
      discount: discount
        ? Number(discount)
        : Math.round(((originalPrice - currentPrice) / originalPrice) * 100),
      category,
      description,
      image,
      reviews: {
        rate: Number(reviews.rate),
        count: Number(reviews.count),
      },
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      quantityAvailable: Number(quantityAvailable),
    });

    // Save the new flash sale product
    const savedProduct = await newFlashSaleProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error occurred while adding product to flashsale:", error);
    res
      .status(500)
      .json({ error: "Error occurred while adding product to flashsale." });
  }
};

module.exports = {
  getFlashSaleProducts,
  addProductToFlashSale,
};
