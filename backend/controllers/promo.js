const Promo = require("../models/promo");

const getAllPromos = async (_req, res) => {
  try {
    const promoProducts = await Promo.find();
    res.status(200).json(promoProducts);
  } catch (error) {
    res.status(500).json("Error fetching promos.");
  }
};

module.exports = { getAllPromos };
