import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, updateProfile, changePassword } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.get("/me", authMiddleware, getMe);

router.put(
  "/profile",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
  ],
  validate,
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

export default router;
