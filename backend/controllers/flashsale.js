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

const addProductToFlashSale = async (req, res) => {
  try {
    const {
      productId, // This is now the _id
      name,
      currentPrice,
      originalPrice,
      category,
      description,
      image,
      reviews,
      startTime,
      endTime,
      quantityAvailable,
    } = req.body;

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

    if (currentPrice >= originalPrice) {
      return res
        .status(400)
        .json({ error: "Current price must be less than original price." });
    }

    // Check if the product exists in the Products collection
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Product does not exist." });
    }

    // Check if the product is already in FlashSale
    const alreadyInFlashSale = await FlashSale.findById(productId);
    if (alreadyInFlashSale) {
      return res
        .status(400)
        .json({ error: "Product is already in flash sale." });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format for start or end time." });
    }

    // Create a new FlashSale entry using productId as _id
    const newFlashSaleProduct = new FlashSale({
      _id: productId, // Explicitly setting it as _id
      name,
      currentPrice,
      originalPrice,
      discount: Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      ),
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

    const savedProduct = await newFlashSaleProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error occurred while adding product to flash sale:", error);

    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Product is already in flash sale." });
    }

    res
      .status(500)
      .json({ error: "Error occurred while adding product to flash sale." });
  }
};

module.exports = {
  getFlashSaleProducts,
  addProductToFlashSale,
};
