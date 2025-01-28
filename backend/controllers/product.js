const Product = require("../models/product.js");
const Cart = require("../models/cart");

// Getting all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

// Getting limited products
const getLimitedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if limit is not provided
    const products = await Product.find().limit(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch limited products." });
  }
};

// Adding a new product.
const addNewProduct = async (req, res) => {
  try {
    const {
      name,
      currentPrice,
      originalPrice,
      category,
      description,
      image,
      reviews,
    } = req.body;

    // Validation of required fields
    if (
      !name ||
      currentPrice === undefined ||
      originalPrice === undefined ||
      !category ||
      !description ||
      !image ||
      !reviews ||
      reviews.rate === undefined ||
      reviews.count === undefined
    ) {
      console.log("Validation failed: Missing fields.");
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate `currentPrice` and `originalPrice` are non-negative
    if (currentPrice < 0 || originalPrice < 0) {
      return res.status(400).json({
        error: "Prices must be non-negative values.",
      });
    }

    // Validate `reviews.rate` and `reviews.count`
    if (reviews.rate < 0 || reviews.rate > 5 || reviews.count < 0) {
      return res.status(400).json({
        error:
          "Invalid review data. Rate must be between 0 and 5, and count must be non-negative.",
      });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      currentPrice,
      originalPrice,
      discount: Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      ),
      category,
      description,
      image,
      reviews,
    });

    // Save product to the database
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    console.error("Error occurred while adding product:", error);
    res.status(500).json({ error: "Error occurred while adding product." });
  }
};

// Getting a single product
const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json();
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Product not found." });
  }
};

//Update a product.
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, image, category } = req.body;

    if (!title || !price || !description || !image || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { title, price, description, image, category },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({ error: "Failed to update product" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error occured while updating the product." });
  }
};

//Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json(`Successfully deleted product ${id}`);
  } catch (error) {
    res.status(500).json({ error: "Error while deleting product." });
  }
};

module.exports = {
  deleteProduct,
  updateProduct,
  getSingleProduct,
  addNewProduct,
  getLimitedProducts,
  getAllProducts,
};
