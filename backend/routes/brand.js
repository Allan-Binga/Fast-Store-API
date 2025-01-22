const express = require("express");
const {getBrands, addBrand} = require("../controllers/brand")

const router = express.Router();

//ROUTES
router.get("/", getBrands);
router.post("/add", addBrand);

module.exports = router;
