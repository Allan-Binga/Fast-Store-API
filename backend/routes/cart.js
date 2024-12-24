import express from "express";
import { addNewCart, deleteCart, getCarts, getLimitedCarts, getSingleCart, getUserCart, updatedCart } from "../controllers/cart.js";

const router = express.Router();

router.get("/", getCarts);
router.get("/limit", getLimitedCarts);
// router.get("/startdate", getCartsDateRange);
router.get("/user/:userId", getUserCart); 
router.get("/:id", getSingleCart); 
router.post("/", addNewCart);
router.put("/:id", updatedCart);
router.delete("/:id", deleteCart);


export default router;
