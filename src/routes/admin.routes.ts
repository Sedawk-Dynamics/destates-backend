import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { validate } from "../middleware/validate";
import {
  getDashboardStats,
  getUsers,
  getInquiries,
  createProperty, updateProperty, deleteProperty,
  createPlot, updatePlot, deletePlot,
  createPG, updatePG, deletePG,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
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

// Properties CRUD
const propertyValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be positive"),
  body("expectedROI").isFloat({ gt: 0 }).withMessage("Expected ROI is required"),
  body("area").isInt({ gt: 0 }).withMessage("Area must be positive"),
  body("units").isInt({ gt: 0 }).withMessage("Units must be positive"),
  body("availableUnits").isInt({ min: 0 }).withMessage("Available units required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router.post("/properties", propertyValidation, validate, createProperty);
router.put("/properties/:id", updateProperty);
router.delete("/properties/:id", deleteProperty);

// Plots CRUD
const plotValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("totalArea").isInt({ gt: 0 }).withMessage("Total area must be positive"),
  body("pricePerSqft").isFloat({ gt: 0 }).withMessage("Price per sqft is required"),
  body("minArea").isInt({ gt: 0 }).withMessage("Min area must be positive"),
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
  body("monthlyRent").isFloat({ gt: 0 }).withMessage("Monthly rent must be positive"),
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
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
];

router.get("/testimonials", getTestimonials);
router.post("/testimonials", testimonialValidation, validate, createTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

export default router;
