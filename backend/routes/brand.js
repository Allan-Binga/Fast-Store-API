const express = require("express");
const {
  getBrands,
  addBrand,
  addProductsToBrands,
} = require("../controllers/brand");

const router = express.Router();

//ROUTES
router.get("/", getBrands);
router.post("/add", addBrand);
router.post("/add-product-to-brand", addProductsToBrands);

module.exports = router;
