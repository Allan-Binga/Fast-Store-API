const express = require("express");
const {
  getFlashSaleProducts,
  addProductToFlashSale,
  addFlashsaleProductsToCart,
} = require("../controllers/flashsale");

const router = express.Router();

//ROUTES
router.get("/", getFlashSaleProducts);
router.post("/add", addProductToFlashSale);
router.post("/add-to-cart", addFlashsaleProductsToCart);

module.exports = router;
