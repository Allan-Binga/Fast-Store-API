import express from 'express';
import {createCheckoutSession} from '../controllers/checkout.js';

const router = express.Router()

router.post("/create-checkout-session", createCheckoutSession)

export default router;