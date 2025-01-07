import express from "express";
import {
  addNewProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct, getLimitedProducts,
  addProductToCart
} from "../controllers/product.js";
import { getAllCategories, getSpecificCategory } from "../controllers/category.js";

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
router.post("/add/:id", addProductToCart)
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
