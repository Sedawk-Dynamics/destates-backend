import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import plotRoutes from "./routes/plot.routes";
import pgRoutes from "./routes/pg.routes";
import cartRoutes from "./routes/cart.routes";
import contactRoutes from "./routes/contact.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";
import prisma from "./utils/prisma";

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Validate required env vars
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is required");

// Trust proxy (needed behind reverse proxy / load balancer)
if (isProduction) app.set("trust proxy", 1);

// CORS — allow specific origins in production, all in development
// Supports both ALLOWED_ORIGINS and CORS_ORIGIN env vars (Dokploy uses either)
const originsEnv = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || "";
const allowedOrigins = originsEnv
  ? originsEnv.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:3000"];

app.use(cors({
  origin: isProduction ? allowedOrigins : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { success: false, message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Health check — verifies database connectivity
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({ status: "ok", message: "Destates API is running", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", message: "Database connection failed", db: "disconnected" });
  }
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", isProduction ? err.message : err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Destates API server running on port ${PORT}`);
});

export default app;
