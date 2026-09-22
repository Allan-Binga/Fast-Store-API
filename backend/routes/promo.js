// Protect customer data and reserve management actions for administrators.
const { authUserMiddleware, authAdminMiddleware } = require("../middleware/jwt");
const express = require("express");
const {getPromos, addProductToPromo }= require("../controllers/promo");

const router = express.Router();

router.get("/", getPromos);
router.post("/add", authUserMiddleware, authAdminMiddleware, addProductToPromo)

module.exports = router;
