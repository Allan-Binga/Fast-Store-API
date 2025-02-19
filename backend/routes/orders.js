const express = require("express")
const {getOrders, getUserOrder} = require("../controllers/orders")

const router = express.Router()

//ROUTES
router.get("/", getOrders)
router.get("/user", getUserOrder)

module.exports = router