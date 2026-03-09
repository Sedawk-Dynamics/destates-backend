import { Router } from "express";
import { body } from "express-validator";
import { submitInquiry } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validate,
  submitInquiry
);

export default router;
