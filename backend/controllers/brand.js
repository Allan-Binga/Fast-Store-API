const Brand = require("../models/brand");
const Product = require("../models/product");

//GETTING BRANDS
const getBrands = async (_req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands." });
  }
};

//ADDING BRANDS
const addBrand = async (req, res) => {
  try {
    //BODY ITEMS
    const { name, logo, slogan } = req.body;
    //VALIDATE BODY AND CHECK FOR MISSING ITEMS
    if ((!name, !logo, !slogan)) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const pluggedBrand = new Brand(req.body);
    const savedBrand = await pluggedBrand.save();
    res.status(200).json(savedBrand);
  } catch (error) {
    res.status(500).json({ error: "Error occured while adding brand." });
  }
};

//ADDING PRODUCTS TO BRANDS
const addProductsToBrands = async (req, res) => {
  try {
    const { brandId, productId } = req.body;

    if (!brandId || !productId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the product exists.
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product does not exist." });
    }

    // Check if the product is already in Brand
    const brand = await Brand.findById(brandId);
    if (brand && brand.products.includes(productId)) {
      return res.status(400).json({ error: "Product is already in brand." });
    }

    // Find the brand associated with this product and add the product to it
    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $push: { products: productId } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedBrand) {
      return res.status(404).json({ error: "No eligible brand found." });
    }

    res
      .status(200)
      .json({ message: "Product added to brand.", brand: updatedBrand });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error occurred while adding product to brand." });
  }
};

//EXPORT FUNCTION
module.exports = { getBrands, addBrand, addProductsToBrands };
