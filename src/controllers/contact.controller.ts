import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, phone, subject, message },
    });

    res.status(201).json({
      success: true,
      data: inquiry,
      message: "Your inquiry has been submitted successfully. We'll get back to you soon!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit inquiry" });
  }
};
