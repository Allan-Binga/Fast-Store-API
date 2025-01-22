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
    //BODY ITEMS
    const {
      productId,
      title,
      image,
      salePrice,
      originalPrice,
      discount,
      startTime,
      endTime,
      quantityAvailable,
    } = req.body;

    //VALIDATE BODY AND CHECK FOR MISSING ITEMS
    if (
      (!productId,
      !salePrice,
      !originalPrice,
      !discount,
      !startTime,
      !endTime,
      !quantityAvailable,
      !image,
      !title)
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }
    //VALIDATE PRODUCT
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Product does not exist." });
    }

    // Convert readable date format to a valid Date object
    const parsedStartTime = moment(
      startTime,
      "dddd MMMM DD YYYY HH:mm"
    ).toDate();
    const parsedEndTime = moment(endTime, "dddd MMMM DD YYYY HH:mm").toDate();

    //CALCULATE DISCOUNT IF NOT PROVIDED
    const calculatedDiscount = `${Math.round(
      ((originalPrice - salePrice) / originalPrice) * 100
    )}%`;

    //FLASHSALE ENTRY TO HANDLE CALCULATED DISCOUNT SITUATION and ADD PRODUCT TO FLASHSALE
    const newFlashSaleProduct = new FlashSale({
      productId,
      title,
      image,
      salePrice,
      originalPrice,
      discount: discount || calculatedDiscount,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      quantityAvailable,
    });

    const savedProduct = await newFlashSaleProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error occured while adding products to flashsale", error);
    res
      .status(500)
      .json({ error: "Error occured while adding product to flashsale." });
  }
};

module.exports = {
  getFlashSaleProducts,
  addProductToFlashSale,
};
