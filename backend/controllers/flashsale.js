const FlashSale = require("../models/flashsale");
const Product = require("../models/product");
const Cart = require("../models/cart");

//GETTING FLASHSALE PRODUCTS
const getFlashSaleProducts = async (_req, res) => {
  try {
    const flashSaleProducts = await FlashSale.find();
    res.status(200).json(flashSaleProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch limited products." });
  }
};

//ADD FLASHSALE PRODUCTS
const addProductToFlashSale = async (req, res) => {
  try {
    const {
      productId, // The _id
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

//ADD FLASHSALE PRODUCTS TO CART
const addFlashsaleProductsToCart = async (req, res) => {
  // EXTRACT storeSession SESSION COOKIE
  const userId = req.cookies.storeSession;

  // IF THERE'S NO COOKIE, RETURN WITH STATUS 401
  if (!userId) {
    return res.status(401).json("Please login to perform this action.");
  }

  try {
    //Retrieve flashsale products
    const flashSaleProducts = await FlashSale.findOne({ _id: userId });

    if (!flashSaleProducts || !flashSaleProducts === 0) {
      return res.status(404).json("No products in Flashsale to add to cart.");
    }

    // RETRIEVE THE Flashsale
    let userCart = await Cart.findOne({ userId });

    if (!userCart) {
      userCart = new Cart({ userId, products: [] });
    }

    // ADD PRODUCTS FROM FLASHSALE TO CART
    for (const product of flashSaleProducts.products) {
      // Check if product already exists in the cart
      if (!userCart.products.some((p) => p._id && p._id.equals(product._id))) {
        userCart.products.push({
          _id: product._id,
          name: product.name,
          description: product.description,
          currentPrice: product.currentPrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          category: product.category,
          image: product.image,
          quantity: 1, // Default quantity to 1
          reviews: product.reviews || {}, // Optional reviews field
        });
      }
    }

    // SAVE UPDATED CART
    await userCart.save();

    res.status(200).json("Added to cart successfully.");
  } catch (error) {
    console.error("Error adding flashsale product to cart:", error);
    res.status(500).json({ error: "Failed to add products to cart." });
  }
};

module.exports = {
  getFlashSaleProducts,
  addProductToFlashSale,
  addFlashsaleProductsToCart,
};
