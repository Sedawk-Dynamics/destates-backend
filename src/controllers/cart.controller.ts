import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    // Enrich cart items with property/plot data
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        let details = null;
        if (item.itemType === "PROPERTY") {
          details = await prisma.property.findUnique({ where: { id: item.itemId } });
        } else if (item.itemType === "PLOT") {
          details = await prisma.landPlot.findUnique({ where: { id: item.itemId } });
        }
        return { ...item, details };
      })
    );

    res.json({ success: true, data: enrichedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

export const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemType, itemId, quantity = 1, selectedArea } = req.body;

    // Check for duplicate
    const existing = await prisma.cartItem.findFirst({
      where: { userId: req.user!.id, itemType, itemId },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      res.json({ success: true, data: updated, message: "Cart item updated" });
      return;
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user!.id,
        itemType,
        itemId,
        quantity,
        selectedArea,
      },
    });

    res.status(201).json({ success: true, data: item, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const item = await prisma.cartItem.updateMany({
      where: { id: String(req.params.id), userId: req.user!.id },
      data: { quantity },
    });

    if (item.count === 0) {
      res.status(404).json({ success: false, message: "Cart item not found" });
      return;
    }

    res.json({ success: true, message: "Cart item updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update cart item" });
  }
};

export const removeItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.cartItem.deleteMany({
      where: { id: String(req.params.id), userId: req.user!.id },
    });

    if (item.count === 0) {
      res.status(404).json({ success: false, message: "Cart item not found" });
      return;
    }

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove cart item" });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};
