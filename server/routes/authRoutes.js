import express from "express";
import { verifyGoogleToken, getUser } from "../controllers/AuthController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/google", verifyGoogleToken);

router.get("/me", authMiddleware, getUser);

export default router;