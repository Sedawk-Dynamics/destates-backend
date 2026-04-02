import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getPlansForProperty,
  createInsuranceOrder,
  verifyInsurancePayment,
  getMyInsurances,
} from "../controllers/insurance.controller";

const router = Router();

router.get("/plans/:propertyId", getPlansForProperty);

router.use(authMiddleware);

router.post(
  "/create-order",
  [
    body("investmentId").notEmpty().withMessage("Investment ID is required"),
    body("insurancePlanId").notEmpty().withMessage("Insurance plan ID is required"),
  ],
  validate,
  createInsuranceOrder
);

router.post(
  "/verify-payment",
  [
    body("razorpay_order_id").notEmpty(),
    body("razorpay_payment_id").notEmpty(),
    body("razorpay_signature").notEmpty(),
  ],
  validate,
  verifyInsurancePayment
);

router.get("/my", getMyInsurances);

export default router;
