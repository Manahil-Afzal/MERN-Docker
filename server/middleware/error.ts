import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";

type AppError = {
  name?: string;
  message?: string;
  statusCode?: number;
  code?: number;
  path?: string;
  keyValue?: Record<string, unknown>;
};

export const ErrorMiddleware = (
  err: unknown,
  req: Request,
  res: Response
) => {
  const error = err as AppError;

  const statusCode = error.statusCode || 500;
  const message = error.message || "internal server error";

  let finalError = new ErrorHandler(message, statusCode);

  if (error.name === "CastError") {
    finalError = new ErrorHandler(
      `Resource not found. Invalid: ${error.path}`,
      400
    );
  }

  if (error.code === 11000) {
    finalError = new ErrorHandler(
      `Duplicate ${Object.keys(error.keyValue || {})} entered`,
      400
    );
  }

  if (error.name === "JsonWebTokenError") {
    finalError = new ErrorHandler("JWT is invalid, try again", 400);
  }

  if (error.name === "TokenExpiredError") {
    finalError = new ErrorHandler("JWT is expired, try again", 400);
  }

  return res.status(finalError.statusCode).json({
    success: false,
    message: finalError.message,
  });
};