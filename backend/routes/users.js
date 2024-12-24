import express from "express";
import {deleteUser, getSingleUser, getUsers, updatedUser } from "../controllers/users.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getSingleUser)
router.delete("/:id", deleteUser)
router.patch("/:id", updatedUser)

export default router;
