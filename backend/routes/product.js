// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
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
// const uploadPhoto = require("../middleware/imageUpload.js");

const router = express.Router();

//New Arrivals route
router.get("/new-arrivals", getNewArrivals);
router.get("/limit", getLimitedProducts);
//router.get("/sort", sortProducts);

// Generic routes later
router.get("/", getAllProducts);

//Search Engine route
router.get("/search", searchResults);
router.get("/:id", getSingleProduct);

router.post("/add-new", authUserMiddleware, authAdminMiddleware, addNewProduct);
router.put("/:id", authUserMiddleware, authAdminMiddleware, updateProduct);
router.delete("/:id", authUserMiddleware, authAdminMiddleware, deleteProduct);

module.exports = router;
