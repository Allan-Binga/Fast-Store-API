const Promo = require("../models/promo");
const Product = require("../models/product");

//GET ALL PROMO PRODUCTS
const getPromos = async (req, res) => {
  try {
    const { type } = req.query;

    //Filter to 'deal' or 'mega-deal'
    const promoFilter = type ? { type, active: true } : { ative: true };

    const promoProducts = await Promo.find(promoFilter)
      .sort({ priority: 1 })
      .populate("product");
    res.status(200).json(promoProducts);
  } catch (error) {
    res.status(500).json("Error fetching promos.");
  }
};

//GET PROMO PRODUCTS BY FILTERING BY 'deal' or 'mega-deal'
const addProductToPromo = async (req, res) => {
  try {
    const { productId, type, priority } = req.body;

    //Field Validation
    if (!productId || !type) {
      return res
        .status(400)
        .json({ error: "Product ID and promo type are required" });
    }
    //Deal validation
    if (!["deal", "mega-deal"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid promo type. Must be 'deal' or 'mega-deal'." });
    }

    //Check if product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    //Check if product exists in promo type
    const existingInPromo = await Promo.findOne({ product: productId, type });
    if (existingInPromo) {
      return res
        .status(400)
        .json({ error: `Product already exists in ${type}.` });
    }

    //Create and save
    const newPromo = new Promo({
      product: productId,
      type,
      priority: priority || 0,
    });

    const savedPromo = await newPromo.save();
    res.status(201).json(savedPromo);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { getPromos, addProductToPromo };
