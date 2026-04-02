import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrder, verifyPayment, getMyInvestments } from "../controllers/investment.controller";

const router = Router();

router.use(authMiddleware);

router.post(
  "/create-order",
  [
    body("propertyId").notEmpty().withMessage("Property ID is required"),
    body("fractions").isInt({ min: 1 }).withMessage("Fractions must be a positive integer"),
  ],
  validate,
  createOrder
);

router.post(
  "/verify-payment",
  [
    body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Signature is required"),
  ],
  validate,
  verifyPayment
);

router.get("/my", getMyInvestments);

export default router;
