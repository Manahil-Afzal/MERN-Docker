import NotificationModel from "../models/notificationModel.js";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cron from "node-cron";

// get all notifications -- only for admin
export const getNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error("Unknown error");
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// update notification status ---only admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      if (notification.status) {
        notification.status = "read";
      }

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error("Unknown error");
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// cleanup job
if (typeof process !== "undefined" && process.env.NODE_ENV !== "vercel") {
  cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    await NotificationModel.deleteMany({
      status: "read",
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log("Deleted read notifications");
  });
}