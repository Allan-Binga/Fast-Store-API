const express = require("express");
const {
  addNewProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getLimitedProducts,
  getNewArrivals,
  searchResults,
} = require("../controllers/product.js");

const { addProductToCart } = require("../controllers/cart.js");

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
//New Arrivals route
router.get("/new-arrivals", getNewArrivals);
//Search Engine route
router.get("/search", searchResults)
router.get("/:id", getSingleProduct);

router.post("/", addNewProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/add-to-cart", addProductToCart);

//New Arrivals route
router.get("/new-arrivals", getNewArrivals);

module.exports = router;
