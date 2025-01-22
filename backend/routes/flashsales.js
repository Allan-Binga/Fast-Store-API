const express = require("express");
const {
  getFlashSaleProducts,
  addProductToFlashSale,
} = require("../controllers/flashsale");

const router = express.Router();

//ROUTES
router.get("/", getFlashSaleProducts);
router.post("/add", addProductToFlashSale);

module.exports = router;
