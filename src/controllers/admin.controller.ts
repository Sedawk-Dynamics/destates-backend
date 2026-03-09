import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

// Dashboard Stats
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, properties, plots, pgs, inquiries] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.landPlot.count(),
      prisma.pGListing.count(),
      prisma.contactInquiry.count(),
    ]);
    res.json({ success: true, data: { users, properties, plots, pgs, inquiries } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

// Users (read-only)
export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Contact Inquiries (read-only)
export const getInquiries = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
};

// Properties CRUD
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create property" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update property" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete property" });
  }
};

// Plots CRUD
export const createPlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plot = await prisma.landPlot.create({ data: req.body });
    res.status(201).json({ success: true, data: plot });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create plot" });
  }
};

export const updatePlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plot = await prisma.landPlot.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: plot });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update plot" });
  }
};

export const deletePlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.landPlot.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Plot deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete plot" });
  }
};

// PG Listings CRUD
export const createPG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pg = await prisma.pGListing.create({ data: req.body });
    res.status(201).json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create PG listing" });
  }
};

export const updatePG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pg = await prisma.pGListing.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update PG listing" });
  }
};

export const deletePG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.pGListing.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "PG listing deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete PG listing" });
  }
};

// Testimonials CRUD
export const getTestimonials = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { id: "desc" } });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create testimonial" });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update testimonial" });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete testimonial" });
  }
};
