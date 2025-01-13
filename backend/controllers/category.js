const Product = require("../models/product")

const getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error occured while fetching categories." });
  }
};

const getSpecificCategory = async (req, res) => {
  try {
    const category = req.params.category;

    const products = await Product.find({ category: category });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: `Category '${category}' not found or has no products.` });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching products." });
  }
};

module.exports = {getAllCategories, getSpecificCategory}