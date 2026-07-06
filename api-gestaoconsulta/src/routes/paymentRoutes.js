import { Router } from "express";
import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Iniciar processo de pagamento – devolve clientSecret
router.post("/:paymentId/create-intent", authenticateToken, paymentController.createPaymentIntent);

router.post("/verify-status/:paymentId", authenticateToken, paymentController.verifyPaymentStatus);

// Webhook do Stripe (deve ser raw body)
router.post("/webhook/stripe", express.raw({ type: "application/json" }), paymentController.handleStripeWebhook);

export default router;