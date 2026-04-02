import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { AuthRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Get insurance plans for a property (public)
export const getPlansForProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propertyId = req.params.propertyId as string;
    const plans = await prisma.insurancePlan.findMany({
      where: {
        active: true,
        properties: { some: { id: propertyId } },
      },
      orderBy: { monthlyPremium: "asc" },
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch insurance plans" });
  }
};

// Create Razorpay order for insurance purchase
export const createInsuranceOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { investmentId, insurancePlanId } = req.body;

    const investment = await prisma.investment.findUnique({ where: { id: investmentId } });
    if (!investment || investment.userId !== req.user!.id || investment.status !== "COMPLETED") {
      res.status(400).json({ success: false, message: "Invalid investment" });
      return;
    }

    // Check plan exists, is active, and is connected to the investment's property
    const plan = await prisma.insurancePlan.findFirst({
      where: {
        id: insurancePlanId,
        active: true,
        properties: { some: { id: investment.propertyId } },
      },
    });
    if (!plan) {
      res.status(400).json({ success: false, message: "Invalid insurance plan for this property" });
      return;
    }

    const existing = await prisma.userInsurance.findFirst({
      where: { investmentId, userId: req.user!.id, status: "ACTIVE" },
    });
    if (existing) {
      res.status(400).json({ success: false, message: "You already have active insurance for this investment" });
      return;
    }

    const amountInPaise = Math.round(plan.monthlyPremium * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ins_${Date.now()}`,
      notes: { investmentId, insurancePlanId, userId: req.user!.id },
    });

    await prisma.userInsurance.create({
      data: {
        userId: req.user!.id,
        investmentId,
        insurancePlanId,
        amountPaid: plan.monthlyPremium,
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
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create insurance order error:", error);
    res.status(500).json({ success: false, message: "Failed to create insurance order" });
  }
};

// Verify insurance payment
export const verifyInsurancePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return;
    }

    const insurance = await prisma.userInsurance.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!insurance) {
      res.status(404).json({ success: false, message: "Insurance record not found" });
      return;
    }
    if (insurance.status === "ACTIVE") {
      res.json({ success: true, data: insurance, message: "Already verified" });
      return;
    }

    const updated = await prisma.userInsurance.update({
      where: { id: insurance.id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: { insurancePlan: true },
    });

    res.json({ success: true, data: updated, message: "Insurance activated successfully" });
  } catch (error) {
    console.error("Verify insurance error:", error);
    res.status(500).json({ success: false, message: "Insurance verification failed" });
  }
};

// Get user's insurances
export const getMyInsurances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const insurances = await prisma.userInsurance.findMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      include: {
        insurancePlan: true,
        investment: { include: { property: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: insurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch insurances" });
  }
};
