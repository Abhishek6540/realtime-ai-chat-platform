import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createOrder, verifyPayment} from "../controllers/PaymentController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);

router.post("/verify", authMiddleware, verifyPayment);

export default router;