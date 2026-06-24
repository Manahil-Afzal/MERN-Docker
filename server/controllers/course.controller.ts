import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import CourseModel from "../models/course.model.js";
import { redis } from "../utils/redis.js";
import userModel from "../models/user.model.js";
import NotificationModel from "../models/notificationModel.js";
import { Types } from "mongoose";

type SafeObj = Record<string, unknown>;

const getStringId = (id: string | string[]): string =>
  Array.isArray(id) ? id[0] : id;

// ================= UPLOAD COURSE =================
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: SafeObj = { ...(req.body || {}) };

      const thumbnailInput = data.thumbnail;

      const thumbnail =
        typeof thumbnailInput === "string"
          ? thumbnailInput.trim()
          : typeof (thumbnailInput as SafeObj)?.url === "string"
          ? ((thumbnailInput as SafeObj).url as string).trim()
          : typeof (thumbnailInput as SafeObj)?.path === "string"
          ? ((thumbnailInput as SafeObj).path as string).trim()
          : "";

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      res.status(201).json({
        success: true,
        message: "Course uploaded successfully",
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// ================= EDIT COURSE =================
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: SafeObj = req.body;
      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// ================= GET SINGLE COURSE =================
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = getStringId(req.params.id);

      const cache = await redis.get(courseId);

      if (cache) {
        return res.status(200).json({
          success: true,
          course: JSON.parse(cache),
        });
      }

      const course = await CourseModel.findById(courseId);

      await redis.set(courseId, JSON.stringify(course), "EX", 604800);

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// ================= GET ALL COURSES =================
export const getAllCourses = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find();

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// ================= GET COURSE BY USER =================
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const dbUser = await userModel.findById(req.user?._id).select("courses");

      if (!dbUser) {
        return next(new ErrorHandler("Please login", 400));
      }

      const list = Array.isArray(dbUser.courses) ? dbUser.courses : [];

      const exists = list.some((course: SafeObj) => {
        const id = (course as SafeObj)?.courseId ?? course;
        return String(id) === String(courseId);
      });

      if (!exists) {
        return next(new ErrorHandler("Not allowed", 403));
      }

      const course = await CourseModel.findById(courseId);

      res.status(200).json({
        success: true,
        content: course?.courseData,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);

// ================= ADD QUESTION =================
export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId } = req.body as {
        question: string;
        courseId: string;
        contentId: string;
      };

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const content = course.courseData.find((item: SafeObj) =>
        String(item._id) === String(contentId)
      );

      if (!content) {
        return next(new ErrorHandler("Invalid content", 400));
      }

      const newQuestion = {
        user: req.user?._id,
        question,
        questionReplies: [],
      };

      (content.questions as SafeObj[]).push(newQuestion);

      course.markModified("courseData");

      await NotificationModel.create({
        user: new Types.ObjectId(String(req.user!._id)),
        title: "New Question",
        message: `Question in ${String((content as SafeObj).title)}`,
      });

      await course.save();

      res.status(200).json({
        success: true,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 500));
    }
  }
);