import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  // Mongoose duplicate key (e.g. same user reserving twice)
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    res
      .status(409)
      .json({
        success: false,
        message: "Duplicate entry — resource already exists",
      });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }
  
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};
