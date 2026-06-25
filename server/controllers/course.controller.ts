import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service.js";
import CourseModel from "../models/course.model.js";
import { redis } from "../utils/redis.js";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import sendMail from "../utils/sendMail.js";
import path from "path";
import ejs from "ejs";
import NotificationModel from "../models/notificationModel.js";
import axios from "axios";
import { Types } from "mongoose";

const getStringId = (id: string | string[]): string => {
  return Array.isArray(id) ? id[0] : id;
};

//upload course

export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { ...(req.body || {}) };
    const thumbnailInput = data.thumbnail;
    const thumbnail =
      typeof thumbnailInput === "string"
        ? thumbnailInput.trim()
        : typeof thumbnailInput?.url === "string"
          ? thumbnailInput.url.trim()
          : typeof thumbnailInput?.path === "string"
            ? thumbnailInput.path.trim()
            : "";

    if (thumbnail) {
      try {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses"
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url
        }
      } catch (uploadError: any) {
        const isRemoteUrl = /^https?:\/\//i.test(thumbnail);

        if (isRemoteUrl) {
          data.thumbnail = {
            public_id: "external-thumbnail",
            url: thumbnail,
          };
        } else {
          throw uploadError;
        }
      }
    }
    await createCourse(data, res, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});


// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const courseId = req.params.id;

    // Find the existing course first to get the OLD public_id
    const courseData = await CourseModel.findById(courseId);

    if (thumbnail && typeof thumbnail === "string" && !thumbnail.startsWith("http")) {
      // Delete old image using the public_id from the DATABASE, not the request
      if ((courseData?.thumbnail as any)?.public_id) {
        await cloudinary.v2.uploader.destroy((courseData!.thumbnail as any).public_id);
      }

      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses"
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
      };
    }

    const course = await CourseModel.findByIdAndUpdate(courseId, {
      $set: data
    }, { new: true });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get single course === without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId: string = getStringId(req.params.id as string | string[]);

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        })
      }

      else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);

        res.status(200).json({
          success: true,
          course,
        });
      }



    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  });

// get all courses -- without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      res.status(200).json({
        success: true,
        courses
      });
    }
    catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.id;
    const dbUser = await userModel.findById(req.user?._id).select("courses");

    if (!dbUser) {
      return next(new ErrorHandler("please login to access this resource", 400));
    }

    const userCourseList = Array.isArray(dbUser.courses) ? dbUser.courses : [];

    const courseExists = userCourseList.some((course: any) => {
      const purchasedId = course?.courseId ?? course?._id ?? course;
      return purchasedId?.toString?.() === courseId.toString();
    });

    if (!courseExists) {
      return next(new ErrorHandler("You are not eligible to access this courses", 404));
    }

    const course = await CourseModel.findById(courseId);

    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add questions in course 
interface IAddQuestionsData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, courseId, contentId }: IAddQuestionsData = req.body;
    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    if (!question || !question.trim()) {
      return next(new ErrorHandler("Question is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id", 400))
    }

    const courseContent = course.courseData?.find((item: any) => item._id.equals(contentId));

    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id", 400));
    }

    // create a new question object
    const newQuestion = {
      user: req.user?._id,
      question: question.trim(),
      questionReplies: [],
    } as any;

    // add this question to our course content
    courseContent.questions.push(newQuestion);

    course.markModified("courseData");

    await NotificationModel.create({
      user: new Types.ObjectId(req.user!._id!.toString()),
      title: "New Question Received",
      message: `you have a new question from ${courseContent.title}`,
    } as any);



    // save the updated courses
    await course.save();

    const savedContent = course.courseData.find((item: any) => item._id.equals(contentId));
    const savedQuestion = savedContent?.questions?.[savedContent.questions.length - 1];

    res.status(200).json({
      success: true,
      question: savedQuestion,
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add answer in course content
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;

    const course = await CourseModel.findById(courseId);

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id", 400))
    }

    const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id", 400));
    }

    const question = courseContent?.questions?.find((item: any) =>
      item._id.equals(questionId)
    );

    if (!question) {
      return next(new ErrorHandler("Invalid question id", 400));
    }

    // create a new answer object
    const newAnswer: any = {
      user: req.user,
      answer,
      createdAt: new Date(),
    }

    // add this answer to our course content
    question.questionReplies.push(newAnswer);

    await course?.save();

    if (req.user?._id === question.user._id) {
      // create a notification 
      await NotificationModel.create({
        user: new Types.ObjectId(req.user!._id!.toString()),
        title: "New Question Reply Received",
        message: `You have a new question reply in ${courseContent.title}`
      } as any)
    } else {
      const data = {
        name: question.user.name,
        title: courseContent.title,
      }
      const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"),
        data);

      try {
        await sendMail({
          email: question.user.email,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }

    res.status(200).json({
      success: true,
      course,
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add review in course
interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.id;

    const dbUser = await userModel.findById(req.user?._id).select("courses");

    if (!dbUser) {
      return next(new ErrorHandler("please login to access this resource", 400));
    }

    const userCourseList = Array.isArray(dbUser.courses) ? dbUser.courses : [];

    const courseExists = userCourseList.some((course: any) => {
      const purchasedId = course?.courseId ?? course?._id ?? course;
      return purchasedId?.toString?.() === courseId.toString();
    });

    if (!courseExists) {
      return next(new ErrorHandler("you are not eligible to access this course", 404));
    }

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const { review, rating } = req.body as IAddReviewData;

    const reviewData: any = {
      user: req.user,
      comment: review,
      rating,
    }

    course.reviews.push(reviewData);

    let avg = 0;

    course.reviews.forEach((rev: any) => {
      avg += rev.rating;
    });

    course.ratings = avg / course.reviews.length;   // 9/2 = 4.5 ratings

    await course.save();
    await redis.del(courseId.toString());

    await NotificationModel.create({
      user: new Types.ObjectId(req.user!._id!.toString()),
      title: "New Review Received",
      message: `${req.user?.name} has given a review in ${course?.name}`,
    } as any);

    // create Notification
    res.status(200).json({
      success: true,
      course,
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add reply in review 
interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment, courseId, reviewId } = req.body as IAddReviewData;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const review = course?.reviews.find((rev: any) => rev._id.toString() === reviewId);

    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    const replyData: any = {
      user: req.user,
      comment,
      createdAt: new Date(),
    };

    if (!review.commentReplies) {
      review.commentReplies = [];
    }

    review.commentReplies?.push(replyData);

    await course.save();
    await redis.del(courseId.toString());

    res.status(200).json({
      success: true,
      course,
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get all courses ---only for admin
export const getAdminAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });


// Delete user --only for admin
export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = getStringId(req.params.id as string | string[]);
      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("User not Found", 404));
      }
      await course.deleteOne();

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

//generate video url
export const generateVideoUrl = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.body;
    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      { ttl: 300 },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
});