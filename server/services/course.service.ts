import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import CourseModel from "../models/course.model.js";

// Create Course
export const createCourse = CatchAsyncError(
  async (
    data: Record<string, unknown>,
    res: Response
  ) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
      success: true,
      course,
    });
  }
);

// Get All Courses
export const getAllCoursesService = async (
  res: Response
): Promise<void> => {
  const courses = await CourseModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    courses,
  });
};