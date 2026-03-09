import { Router } from "express";
import { body } from "express-validator";
import { getCart, addItem, updateItem, removeItem, clearCart } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authMiddleware);

router.get("/", getCart);

router.post(
  "/",
  [
    body("itemType").isIn(["PROPERTY", "PLOT"]).withMessage("Item type must be PROPERTY or PLOT"),
    body("itemId").notEmpty().withMessage("Item ID is required"),
  ],
  validate,
  addItem
);

router.patch("/:id", updateItem);
router.delete("/:id", removeItem);
router.delete("/", clearCart);

export default router;
