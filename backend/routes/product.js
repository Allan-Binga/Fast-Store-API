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


const router = express.Router();

//New Arrivals route
router.get("/new-arrivals", getNewArrivals)
router.get("/limit", getLimitedProducts);
//router.get("/sort", sortProducts);

// Generic routes later
router.get("/", getAllProducts);

//Search Engine route
router.get("/search", searchResults)
router.get("/:id", getSingleProduct);

router.post("/", addNewProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/add-to-cart", addProductToCart);


module.exports = router;
