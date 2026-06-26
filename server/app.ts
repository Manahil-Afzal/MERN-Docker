import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { ErrorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";
import orderRouter from "./routes/order.route.js";
import notificationRouter from "./routes/notification.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import layoutRouter from "./routes/layout.route.js";

export const app = express();

app.set("trust proxy", 1);

// Body Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: [
      "http://13.53.127.99:3000",
    ],
    credentials: true,
  })
);

// API Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/layout", layoutRouter);

// Home Route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// Test Route
app.get("/test", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// Unknown Route Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(
    `Route ${req.originalUrl} not found`
  ) as Error & { statusCode?: number };

  err.statusCode = 404;

  next(err);
});

// Error Middleware
app.use(ErrorMiddleware);