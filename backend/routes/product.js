const express = require("express");
const {
  addNewProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getLimitedProducts,
  addProductToCart,
} = require("../controllers/product.js");

const {
  getAllCategories,
  getSpecificCategory,
} = require("../controllers/category.js");

const router = express.Router();

// More specific routes first
router.get("/categories", getAllCategories);
router.get("/category/:category", getSpecificCategory);

router.get("/limit", getLimitedProducts);
//router.get("/sort", sortProducts);

// Generic routes later
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.post("/", addNewProduct);
router.post("/add/:id", addProductToCart);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
