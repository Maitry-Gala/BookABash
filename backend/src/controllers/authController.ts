import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().min(3).max(25).email(),
  password: z
    .string()
    .min(6)
    .max(10)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[@!$%*?&])[A-Za-z\d@!$%*?&]+$/),
  firstName: z.string().min(3).max(10),
  lastName: z.string().min(3).max(10),
});

const loginSchema = z.object({
  email: z.string().min(3).max(25).email(),
  password: z
    .string()
    .min(6)
    .max(10)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[@!$%*?&])[A-Za-z\d@!$%*?&]+$/),
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed" });
  }

  const { email, password, firstName, lastName } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashed,
    firstName,
    lastName,
  });

  return res
    .status(201)
    .json({ success: true, user: { id: user._id, email, firstName } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed" });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    success: true,
    token,
    user: { id: user._id, email, firstName: user.firstName },
  });
});
