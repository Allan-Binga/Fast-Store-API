// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getFlashSaleProducts,
  addProductToFlashSale,
  addFlashsaleProductsToCart,
} = require("../controllers/flashsale");

const router = express.Router();

//ROUTES
router.get("/", getFlashSaleProducts);
router.post("/add", authUserMiddleware, authAdminMiddleware, addProductToFlashSale);
router.post("/add-to-cart", authUserMiddleware, addFlashsaleProductsToCart);

module.exports = router;
