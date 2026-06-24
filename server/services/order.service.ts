import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import OrderModel from "../models/orderModel.js";

// Create New Order
export const newOrder = CatchAsyncError(
  async (
    data: Record<string, unknown>,
    res: Response
  ) => {
    const order = await OrderModel.create(data);

    res.status(201).json({
      success: true,
      order,
    });
  }
);

// Get All Orders
export const getAllOrdersService = async (
  res: Response
): Promise<void> => {
  const orders = await OrderModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
};