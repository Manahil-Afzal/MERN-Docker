import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import { generateLast12MonthsData } from "../utils/analytics.generator.js";
import userModel from "../models/user.model.js";
import CourseModel from "../models/course.model.js";
import OrderModel from "../models/orderModel.js";

// Get Users Analytics --- Admin Only
export const getUsersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel);

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      return next(new ErrorHandler(message, 500));
    }
  }
);

// Get Courses Analytics --- Admin Only
export const getCoursesAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generateLast12MonthsData(CourseModel);

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      return next(new ErrorHandler(message, 500));
    }
  }
);

// Get Orders Analytics --- Admin Only
export const getOrdersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generateLast12MonthsData(OrderModel);

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      return next(new ErrorHandler(message, 500));
    }
  }
);