import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { validate } from "../middleware/validate";
import {
  getDashboardStats,
  getUsers,
  getInquiries,
  getInvestments,
  fractionSplit,
  createProperty, updateProperty, deleteProperty, togglePropertyDisabled,
  createPlot, updatePlot, deletePlot,
  createPG, updatePG, deletePG,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getAllInsurancePlans, getInsurancePlans, createInsurancePlan, updateInsurancePlan, deleteInsurancePlan, connectInsurancePlan, disconnectInsurancePlan,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/stats", getDashboardStats);

// Users (read-only)
router.get("/users", getUsers);

// Inquiries (read-only)
router.get("/inquiries", getInquiries);

// Investments (read-only)
router.get("/investments", getInvestments);

// Properties CRUD
const positiveNumber = (field: string, msg: string) =>
  body(field).custom((v) => { if (typeof v !== "number" || v <= 0) throw new Error(msg); return true; });
const nonNegativeInt = (field: string, msg: string) =>
  body(field).custom((v) => { if (typeof v !== "number" || v < 0 || !Number.isInteger(v)) throw new Error(msg); return true; });

const propertyValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  positiveNumber("price", "Price must be positive"),
  positiveNumber("expectedROI", "Expected ROI is required"),
  body("area").custom((v) => { if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) throw new Error("Area must be positive"); return true; }),
  body("totalFractions").custom((v) => { if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) throw new Error("Total fractions must be positive"); return true; }),
  nonNegativeInt("availableFractions", "Available fractions required"),
  positiveNumber("pricePerFraction", "Price per fraction must be positive"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router.post("/properties", propertyValidation, validate, createProperty);
router.put("/properties/:id", updateProperty);
router.put("/properties/:id/fraction-split", fractionSplit);
router.put("/properties/:id/toggle-disabled", togglePropertyDisabled);
router.delete("/properties/:id", deleteProperty);

// Plots CRUD
const plotValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("totalArea").custom((v) => { if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) throw new Error("Total area must be positive"); return true; }),
  positiveNumber("pricePerSqft", "Price per sqft is required"),
  body("minArea").custom((v) => { if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) throw new Error("Min area must be positive"); return true; }),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router.post("/plots", plotValidation, validate, createPlot);
router.put("/plots/:id", updatePlot);
router.delete("/plots/:id", deletePlot);

// PG Listings CRUD
const pgValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  positiveNumber("monthlyRent", "Monthly rent must be positive"),
  body("roomType").trim().notEmpty().withMessage("Room type is required"),
  body("contactPhone").trim().notEmpty().withMessage("Contact phone is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router.post("/pgs", pgValidation, validate, createPG);
router.put("/pgs/:id", updatePG);
router.delete("/pgs/:id", deletePG);

// Testimonials CRUD
const testimonialValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("designation").trim().notEmpty().withMessage("Designation is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("rating").custom((v) => { if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) throw new Error("Rating must be 1-5"); return true; }),
];

router.get("/testimonials", getTestimonials);
router.post("/testimonials", testimonialValidation, validate, createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

// Insurance Plans CRUD
router.get("/insurance-plans", getAllInsurancePlans);
router.get("/insurance-plans/:propertyId", getInsurancePlans);
router.post("/insurance-plans", createInsurancePlan);
router.put("/insurance-plans/:id", updateInsurancePlan);
router.delete("/insurance-plans/:id", deleteInsurancePlan);
router.post("/insurance-plans/connect", connectInsurancePlan);
router.post("/insurance-plans/disconnect", disconnectInsurancePlan);

export default router;
