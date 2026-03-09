import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
  }
});

export default router;
