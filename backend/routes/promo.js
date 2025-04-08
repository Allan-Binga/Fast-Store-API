const express = require("express");
const {getPromos, addProductToPromo }= require("../controllers/promo");

const router = express.Router();

router.get("/", getPromos);
router.post("/add", addProductToPromo)

module.exports = router;
