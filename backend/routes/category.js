const express = require("express")
const {getAllCategories, getCategoryProducts} = require("../controllers/category")

const router = express.Router()

// More specific routes first
router.get("/all", getAllCategories);
router.get("/:category", getCategoryProducts);

module.exports = router