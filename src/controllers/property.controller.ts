import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, status, minROI, maxPrice, type } = req.query;

    const where: Record<string, unknown> = {};
    if (city) where.city = String(city);
    if (status) where.status = String(status);
    if (type) where.type = String(type);
    if (minROI) where.expectedROI = { gte: parseFloat(String(minROI)) };
    if (maxPrice) where.price = { lte: parseFloat(String(maxPrice)) };

    const properties = await prisma.property.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: properties });
  } catch (error) {
    console.error("Properties error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch property" });
  }
};
