const express = require("express");
const {getAllPromos }= require("../controllers/promo");

const router = express.Router();

router.get("/", getAllPromos);

module.exports = router;
