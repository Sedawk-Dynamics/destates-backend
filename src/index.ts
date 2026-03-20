import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import propertyRoutes from "./routes/property.routes";
import plotRoutes from "./routes/plot.routes";
import pgRoutes from "./routes/pg.routes";
import cartRoutes from "./routes/cart.routes";
import contactRoutes from "./routes/contact.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Validate required env vars
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL environment variable is required");

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Destates API is running" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Destates API server running on http://localhost:${PORT}`);
});

export default app;
