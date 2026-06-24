import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import { v2 as cloudinary } from "cloudinary";
import LayoutModel from "../models/layout.model.js";

// ================= TYPES =================
interface ILayoutRequestBody {
  type: string;
  image?: string;
  title?: string;
  subtitle?: string;
  subTitle?: string;
  tagline?: string;
  tagLine?: string;
  faq?: {
    question?: string;
    Question?: string;
    answer?: string;
    Answer?: string;
  }[];
  categories?: {
    title?: string;
    Title?: string;
  }[];
}

// ================= CREATE LAYOUT =================
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as ILayoutRequestBody;
      const { type } = body;

      // BANNER
      if (type === "Banner") {
        const {
          image,
          title,
          subtitle,
          subTitle,
          tagline,
          tagLine,
        } = body;

        if (!image) {
          return next(new ErrorHandler("Banner image is required", 400));
        }

        const myCloud = await cloudinary.uploader.upload(image, {
          folder: "layout",
        });

        await LayoutModel.findOneAndUpdate(
          { type: "Banner" },
          {
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
          },
          { upsert: true, new: true }
        );
      }

      // FAQ
      if (type === "FAQ") {
        const faqItems = (body.faq || []).map((item) => ({
          question: item.question || item.Question,
          answer: item.answer || item.Answer,
        }));

        await LayoutModel.findOneAndUpdate(
          { type: "FAQ" },
          { type: "FAQ", faq: faqItems },
          { upsert: true, new: true }
        );
      }

      // Categories
      if (type === "Categories") {
        const categoriesItems = (body.categories || []).map((c) => ({
          title: c.title || c.Title,
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
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error : new Error("Unknown error");

      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// ================= EDIT + GET remain same fix pattern =================