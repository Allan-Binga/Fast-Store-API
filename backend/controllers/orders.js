const Order = require("../models/orders");
const { asyncHandler, pagination } = require("../utils/http");

// Management routes are admin-only; shopper history is always owner-scoped.
const getOrders = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit)); });
const getUserOrder = asyncHandler(async (req, res) => { const { limit, skip } = pagination(req); res.json(await Order.find({ user: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)); });
module.exports = { getOrders, getUserOrder };
