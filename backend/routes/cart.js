import express from "express";
import { getCart, getCartsUser } from "../controllers/cart.js";

const router = express.Router();

router.get("/", getCart)
router.get("/:id", getCartsUser);

export default router;
