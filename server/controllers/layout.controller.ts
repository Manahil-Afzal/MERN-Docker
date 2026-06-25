import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import { v2 as cloudinary } from "cloudinary";
import LayoutModel from "../models/layout.model.js";


// CREATE LAYOUT
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.body;

    // ================= BANNER =================
    if (type === "Banner") {
      const { image, title, subtitle, subTitle, tagline, tagLine } = req.body;

      if (!image) {
        return next(new ErrorHandler("Banner image is required", 400));
      }

      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "layout",
      });

      const banner = {
        type: "Banner",
        banner: {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subtitle: subtitle ?? subTitle,
          tagline: tagline ?? tagLine,
        },
      };

      await LayoutModel.findOneAndUpdate(
        { type: "Banner" },
        banner,
        { upsert: true, new: true }
      );
    }

    // ================= FAQ =================
    if (type === "FAQ") {
      const { faq = [] } = req.body;

      const faqItems = faq.map((item: any) => ({
        question: item.question || item.Question,
        answer: item.answer || item.Answer,
      }));

      await LayoutModel.findOneAndUpdate(
        { type: "FAQ" },
        { type: "FAQ", faq: faqItems },
        { upsert: true, new: true }
      );
    }

    // ================= CATEGORIES =================
    if (type === "Categories") {
      const { categories = [] } = req.body;

      const categoriesItems = categories.map((category: any) => ({
        title: category.title || category.Title,
      }));

      await LayoutModel.findOneAndUpdate(
        { type: "Categories" },
        { type: "Categories", categories: categoriesItems },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Layout processed successfully",
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});



// EDIT LAYOUT
export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.body;

    // ================= BANNER =================
    if (type === "Banner") {
      const bannerData: any = await LayoutModel.findOne({ type: "Banner" });

      const { image, title, subtitle, subTitle, tagline, tagLine } = req.body;

      if (bannerData?.banner?.image?.public_id) {
        await cloudinary.uploader.destroy(bannerData.banner.image.public_id);
      }

      if (!image) {
        return next(new ErrorHandler("Banner image is required", 400));
      }

      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "layout",
      });

      const banner = {
        type: "Banner",
        banner: {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subtitle: subtitle ?? subTitle,
          tagline: tagline ?? tagLine,
        },
      };

      await LayoutModel.findOneAndUpdate(
        { type: "Banner" },
        banner,
        { upsert: true, new: true }
      );
    }

    // ================= FAQ =================
    if (type === "FAQ") {
      const { faq = [] } = req.body;

      const faqItems = faq.map((item: any) => ({
        question: item.question || item.Question,
        answer: item.answer || item.Answer,
      }));

      await LayoutModel.findOneAndUpdate(
        { type: "FAQ" },
        { type: "FAQ", faq: faqItems },
        { upsert: true, new: true }
      );
    }

    // ================= CATEGORIES =================
    if (type === "Categories") {
      const { categories = [] } = req.body;

      const categoriesItems = categories.map((category: any) => ({
        title: category.title || category.Title,
      }));

      await LayoutModel.findOneAndUpdate(
        { type: "Categories" },
        { type: "Categories", categories: categoriesItems },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Layout updated successfully",
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// GET LAYOUT BY TYPE
export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;

    const layout = await LayoutModel.findOne({
      type: { $regex: new RegExp(`^${type}$`, "i") },
    });

    if (!layout) {
      return next(new ErrorHandler(`Layout type ${type} not found`, 404));
    }

    res.status(200).json({
      success: true,
      layout,
    });

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});