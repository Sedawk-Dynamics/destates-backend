import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, minArea, maxPrice } = req.query;

    const where: Record<string, unknown> = {};
    if (city) where.city = String(city);
    if (minArea) where.totalArea = { gte: parseInt(String(minArea)) };
    if (maxPrice) where.pricePerSqft = { lte: parseFloat(String(maxPrice)) };

    const plots = await prisma.landPlot.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: plots });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch plots" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const plot = await prisma.landPlot.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!plot) {
      res.status(404).json({ success: false, message: "Plot not found" });
      return;
    }

    res.json({ success: true, data: plot });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch plot" });
  }
};
