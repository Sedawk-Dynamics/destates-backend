import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, roomType, maxRent } = req.query;

    const where: Record<string, unknown> = {};
    if (city) where.city = String(city);
    if (roomType) where.roomType = String(roomType);
    if (maxRent) where.monthlyRent = { lte: parseFloat(String(maxRent)) };

    const pgs = await prisma.pGListing.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: pgs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch PG listings" });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pg = await prisma.pGListing.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!pg) {
      res.status(404).json({ success: false, message: "PG listing not found" });
      return;
    }

    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch PG listing" });
  }
};
