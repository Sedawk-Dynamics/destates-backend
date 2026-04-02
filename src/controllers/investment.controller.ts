import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Razorpay order for fractional investment
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, fractions } = req.body;
    const fractionsCount = Number(fractions);

    if (!propertyId || !fractionsCount || fractionsCount < 1 || !Number.isInteger(fractionsCount)) {
      res.status(400).json({ success: false, message: "Valid propertyId and fractions (positive integer) are required" });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    if (property.disabled) {
      res.status(400).json({ success: false, message: "This property is currently disabled" });
      return;
    }

    if (property.status === "SOLD_OUT") {
      res.status(400).json({ success: false, message: "This property is sold out" });
      return;
    }

    if (fractionsCount < (property.minFractions || 1)) {
      res.status(400).json({ success: false, message: `Minimum ${property.minFractions || 1} fractions required` });
      return;
    }

    if (property.maxFractions && fractionsCount > property.maxFractions) {
      res.status(400).json({ success: false, message: `Maximum ${property.maxFractions} fractions allowed per purchase` });
      return;
    }

    if (fractionsCount > property.availableFractions) {
      res.status(400).json({
        success: false,
        message: `Only ${property.availableFractions} fractions available`,
      });
      return;
    }

    const amount = fractionsCount * property.pricePerFraction;
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `inv_${Date.now()}`,
      notes: {
        propertyId,
        userId: req.user!.id,
        fractions: String(fractionsCount),
      },
    });

    // Create pending investment record
    const investment = await prisma.investment.create({
      data: {
        userId: req.user!.id,
        propertyId,
        fractions: fractionsCount,
        amountPaid: amount,
        pricePerFraction: property.pricePerFraction,
        status: "PENDING",
        razorpayOrderId: order.id,
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        investmentId: investment.id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// Verify Razorpay payment and finalize investment
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: "Missing payment verification fields" });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return;
    }

    // Find the pending investment
    const investment = await prisma.investment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!investment) {
      res.status(404).json({ success: false, message: "Investment not found" });
      return;
    }

    if (investment.status === "COMPLETED") {
      res.json({ success: true, data: investment, message: "Payment already verified" });
      return;
    }

    // Use interactive transaction to ensure atomicity
    const updatedInvestment = await prisma.$transaction(async (tx) => {
      // 1. Mark investment as completed
      const inv = await tx.investment.update({
        where: { id: investment.id },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        include: { property: true },
      });

      // 2. Reduce available fractions
      const property = await tx.property.update({
        where: { id: investment.propertyId },
        data: {
          availableFractions: { decrement: investment.fractions },
        },
      });

      // 3. Update property status based on remaining fractions
      const remaining = property.availableFractions;
      let newStatus: "AVAILABLE" | "LIMITED" | "SOLD_OUT" = "AVAILABLE";
      if (remaining <= 0) {
        newStatus = "SOLD_OUT";
      } else if (remaining <= Math.ceil(property.totalFractions * 0.2)) {
        newStatus = "LIMITED";
      }
      if (newStatus !== property.status) {
        await tx.property.update({
          where: { id: property.id },
          data: { status: newStatus },
        });
      }

      return inv;
    });

    res.json({ success: true, data: updatedInvestment, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// Get current user's investments
export const getMyInvestments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.user!.id, status: "COMPLETED" },
      include: {
        property: true,
        insurances: {
          where: { status: "ACTIVE" },
          include: { insurancePlan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: investments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch investments" });
  }
};
