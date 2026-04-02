import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

// Dashboard Stats
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, properties, plots, pgs, inquiries, investments, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.landPlot.count(),
      prisma.pGListing.count(),
      prisma.contactInquiry.count(),
      prisma.investment.count({ where: { status: "COMPLETED" } }),
      prisma.investment.aggregate({ where: { status: "COMPLETED" }, _sum: { amountPaid: true } }),
    ]);
    res.json({
      success: true,
      data: {
        users, properties, plots, pgs, inquiries,
        investments,
        totalRevenue: totalRevenue._sum.amountPaid || 0,
      },
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
};

// Investments (read-only for admin)
export const getInvestments = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const investments = await prisma.investment.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, name: true, city: true, pricePerFraction: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: investments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch investments" });
  }
};

// Fraction Split — recalculate all investor holdings when admin changes fractions/price
export const fractionSplit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { newTotalFractions, newPricePerFraction } = req.body;

    if (!newTotalFractions || !newPricePerFraction || newTotalFractions < 1 || newPricePerFraction <= 0) {
      res.status(400).json({ success: false, message: "Valid newTotalFractions and newPricePerFraction are required" });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    const oldTotalFractions = property.totalFractions;
    const splitRatio = newTotalFractions / oldTotalFractions;

    await prisma.$transaction(async (tx) => {
      // 1. Get all completed investments for this property
      const investments = await tx.investment.findMany({
        where: { propertyId: id, status: "COMPLETED" },
        include: { user: { select: { id: true, name: true } } },
      });

      // 2. Update each investment: multiply fractions by split ratio, update pricePerFraction
      for (const inv of investments) {
        const newFractions = Math.round(inv.fractions * splitRatio);
        await tx.investment.update({
          where: { id: inv.id },
          data: {
            fractions: newFractions,
            pricePerFraction: newPricePerFraction,
          },
        });

        // 3. Create notification for each investor
        await tx.notification.create({
          data: {
            userId: inv.userId,
            title: "Fraction Split — Your Holdings Updated",
            message: `${property.name}: Your ${inv.fractions} fraction(s) have been split to ${newFractions} fraction(s). New price per fraction: ₹${newPricePerFraction.toLocaleString("en-IN")}. Your total investment value remains the same.`,
          },
        });
      }

      // 4. Update property fractions and price
      const soldFractions = oldTotalFractions - property.availableFractions;
      const newSoldFractions = Math.round(soldFractions * splitRatio);
      const newAvailableFractions = newTotalFractions - newSoldFractions;

      await tx.property.update({
        where: { id },
        data: {
          totalFractions: newTotalFractions,
          availableFractions: newAvailableFractions,
          pricePerFraction: newPricePerFraction,
        },
      });
    });

    const updated = await prisma.property.findUnique({ where: { id } });
    res.json({
      success: true,
      data: updated,
      message: `Fraction split completed. Split ratio: ${splitRatio}x`,
    });
  } catch (error) {
    console.error("Fraction split error:", error);
    res.status(500).json({ success: false, message: "Failed to perform fraction split" });
  }
};

// Properties CRUD
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create property" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const current = await prisma.property.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    const newTotal = req.body.totalFractions;
    const newPrice = req.body.pricePerFraction;
    const fractionsChanged = newTotal !== undefined && newTotal !== current.totalFractions;
    const priceChanged = newPrice !== undefined && newPrice !== current.pricePerFraction;

    // If fractions or price changed and there are investors, run split logic
    if (fractionsChanged || priceChanged) {
      const investmentCount = await prisma.investment.count({
        where: { propertyId: id, status: "COMPLETED" },
      });

      if (investmentCount > 0) {
        const finalTotal = newTotal ?? current.totalFractions;
        const finalPrice = newPrice ?? current.pricePerFraction;
        const splitRatio = finalTotal / current.totalFractions;

        // Remove totalFractions, availableFractions, pricePerFraction from body — we handle them in the split
        const { totalFractions: _t, availableFractions: _a, pricePerFraction: _p, ...otherFields } = req.body;

        await prisma.$transaction(async (tx) => {
          // Update other fields first
          if (Object.keys(otherFields).length > 0) {
            await tx.property.update({ where: { id }, data: otherFields });
          }

          // Run split on investments
          const investments = await tx.investment.findMany({
            where: { propertyId: id, status: "COMPLETED" },
            include: { user: { select: { id: true, name: true } } },
          });

          for (const inv of investments) {
            const newFractions = Math.round(inv.fractions * splitRatio);
            await tx.investment.update({
              where: { id: inv.id },
              data: { fractions: newFractions, pricePerFraction: finalPrice },
            });

            await tx.notification.create({
              data: {
                userId: inv.userId,
                title: "Fraction Split — Your Holdings Updated",
                message: `${current.name}: Your ${inv.fractions} fraction(s) have been adjusted to ${newFractions} fraction(s). New price per fraction: ₹${finalPrice.toLocaleString("en-IN")}. Your total investment value remains the same.`,
              },
            });
          }

          // Recalculate available fractions proportionally
          const soldFractions = current.totalFractions - current.availableFractions;
          const newSoldFractions = Math.round(soldFractions * splitRatio);
          const newAvailable = finalTotal - newSoldFractions;

          await tx.property.update({
            where: { id },
            data: {
              totalFractions: finalTotal,
              availableFractions: newAvailable,
              pricePerFraction: finalPrice,
            },
          });
        });

        const updated = await prisma.property.findUnique({ where: { id } });
        res.json({ success: true, data: updated, message: "Property updated with fraction split applied" });
        return;
      }
    }

    // No investors affected — just update normally
    const property = await prisma.property.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update property" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Check if any investments exist for this property
    const investmentCount = await prisma.investment.count({
      where: { propertyId: id, status: "COMPLETED" },
    });

    if (investmentCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete this property — ${investmentCount} investor(s) have invested in it. You can disable it instead.`,
      });
      return;
    }

    await prisma.property.delete({ where: { id } });
    res.json({ success: true, message: "Property deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete property" });
  }
};

export const togglePropertyDisabled = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    const newDisabled = !property.disabled;

    const updated = await prisma.property.update({
      where: { id },
      data: { disabled: newDisabled },
    });

    // Notify investors if property is being disabled
    if (newDisabled) {
      const investments = await prisma.investment.findMany({
        where: { propertyId: id, status: "COMPLETED" },
        select: { userId: true },
      });

      const uniqueUserIds = [...new Set(investments.map((i) => i.userId))];
      if (uniqueUserIds.length > 0) {
        await prisma.notification.createMany({
          data: uniqueUserIds.map((userId) => ({
            userId,
            title: "Property Disabled",
            message: `${property.name} has been disabled by the admin. New investments are paused. Your existing holdings remain safe.`,
          })),
        });
      }
    }

    res.json({
      success: true,
      data: updated,
      message: newDisabled ? "Property disabled" : "Property enabled",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to toggle property status" });
  }
};

// Plots CRUD
export const createPlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plot = await prisma.landPlot.create({ data: req.body });
    res.status(201).json({ success: true, data: plot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create plot" });
  }
};

export const updatePlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const plot = await prisma.landPlot.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: plot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update plot" });
  }
};

export const deletePlot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.landPlot.delete({ where: { id } });
    res.json({ success: true, message: "Plot deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete plot" });
  }
};

// PG Listings CRUD
export const createPG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pg = await prisma.pGListing.create({ data: req.body });
    res.status(201).json({ success: true, data: pg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create PG listing" });
  }
};

export const updatePG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pg = await prisma.pGListing.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: pg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update PG listing" });
  }
};

export const deletePG = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.pGListing.delete({ where: { id } });
    res.json({ success: true, message: "PG listing deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete PG listing" });
  }
};

// Testimonials CRUD
export const getTestimonials = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { id: "desc" } });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create testimonial" });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update testimonial" });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete testimonial" });
  }
};

// Insurance Plans CRUD
export const getAllInsurancePlans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await prisma.insurancePlan.findMany({
      include: { properties: { select: { id: true, name: true, city: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch insurance plans" });
  }
};

export const getInsurancePlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propertyId = req.params.propertyId as string;
    const plans = await prisma.insurancePlan.findMany({
      where: { properties: { some: { id: propertyId } } },
      orderBy: { monthlyPremium: "asc" },
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch insurance plans" });
  }
};

export const connectInsurancePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId, propertyId } = req.body;
    await prisma.insurancePlan.update({
      where: { id: planId },
      data: { properties: { connect: { id: propertyId } } },
    });
    res.json({ success: true, message: "Plan connected to property" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to connect plan" });
  }
};

export const disconnectInsurancePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId, propertyId } = req.body;
    await prisma.insurancePlan.update({
      where: { id: planId },
      data: { properties: { disconnect: { id: propertyId } } },
    });
    res.json({ success: true, message: "Plan disconnected from property" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to disconnect plan" });
  }
};

export const createInsurancePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await prisma.insurancePlan.create({ data: req.body });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create insurance plan" });
  }
};

export const updateInsurancePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const plan = await prisma.insurancePlan.update({ where: { id }, data: req.body });
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update insurance plan" });
  }
};

export const deleteInsurancePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.insurancePlan.delete({ where: { id } });
    res.json({ success: true, message: "Insurance plan deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete insurance plan" });
  }
};
