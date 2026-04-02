import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, status, minROI, maxPrice, type } = req.query;

    const where: Record<string, unknown> = { disabled: false };
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

    // If disabled, only allow access if the user has invested in it
    if (property.disabled) {
      const userId = extractUserId(req);
      if (!userId) {
        res.status(404).json({ success: false, message: "Property not found" });
        return;
      }

      const hasInvestment = await prisma.investment.count({
        where: { propertyId: property.id, userId, status: "COMPLETED" },
      });

      if (hasInvestment === 0) {
        res.status(404).json({ success: false, message: "Property not found" });
        return;
      }
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch property" });
  }
};

// Extract user ID from token without requiring auth
function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET as string) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}
