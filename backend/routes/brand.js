// Protect customer data and reserve management actions for administrators.
const { authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {
  getBrands,
  getBrandWithProducts,
  addBrand,
  addProductsToBrands,
} = require("../controllers/brand");
const { uploadBrandLogo } = require("../middleware/imageUpload.js");

const router = express.Router();

//ROUTES
router.get("/", getBrands);
router.get("/:id", getBrandWithProducts);
router.post("/add", authAdminMiddleware, uploadBrandLogo, addBrand);
router.post("/add-product-to-brand", authAdminMiddleware, addProductsToBrands);

module.exports = router;
