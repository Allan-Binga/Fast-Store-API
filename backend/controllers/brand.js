const Brand = require("../models/brand");

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

//EXPORT FUNCTION
module.exports = { getBrands, addBrand };
