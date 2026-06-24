import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import userModel, { IUser } from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import sendMail from "../utils/sendMail.js";
import { sendToken } from "../utils/jwt.js";
import { redis } from "../utils/redis.js";
import connectDB from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= TYPES =================
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IActivationToken {
  token: string;
  activationCode: string;
}

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

interface ILoginRequest {
  email: string;
  password: string;
}

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

interface IUpdateUserInfo {
  name?: string;
}

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

interface IAddMemberBody {
  email: string;
  role: "admin" | "user";
}

// ================= REGISTER =================
export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as IRegistrationBody;

      const isEmailExist = await userModel.findOne({ email });

      if (isEmailExist && isEmailExist.isVerified) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const activationToken = createActivationToken({
        name,
        email,
        password,
      });

      const data = {
        user: { name },
        activationCode: activationToken.activationCode,
      };

      await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      await sendMail({
        email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Check email: ${email}`,
        activationToken: activationToken.token,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= TOKEN =================
export const createActivationToken = (
  user: IRegistrationBody
): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const expiresIn = (process.env.ACTIVATION_TOKEN_EXPIRES_IN ||
    "15m") as SignOptions["expiresIn"];

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn }
  );

  return { token, activationCode };
};

// ================= ACTIVATE =================
export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const decoded = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (decoded.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = decoded.user;

      const existUser = await userModel.findOne({ email });

      if (existUser && existUser.isVerified) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      if (existUser && !existUser.isVerified) {
        existUser.name = name;
        existUser.password = password;
        existUser.isVerified = true;
        await existUser.save();
      } else {
        await userModel.create({ name, email, password, isVerified: true });
      }

      res.status(201).json({ success: true });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= LOGIN =================
export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      const user = await userModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const match = await user.comparePassword(password);

      if (!match) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      sendToken(user, 200, res);
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= LOGOUT =================
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      const userId = req.user?._id;
      if (userId) await redis.del(String(userId));

      res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= SOCIAL AUTH =================
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response) => {
    await connectDB();

    const { email, name, avatar } = req.body as ISocialAuthBody;

    const user = await userModel.findOne({ email });

    if (!user) {
      const newUser = await userModel.create({
        email,
        name,
        avatar: { public_id: "", url: avatar },
      });
      return sendToken(newUser, 200, res);
    }

    return sendToken(user, 200, res);
  }
);

// ================= UPDATE USER =================
export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as IUpdateUserInfo;

      const user = await userModel.findById(req.user?._id);

      if (user && name) user.name = name;

      await user?.save();

      await redis.set(String(req.user?._id), JSON.stringify(user));

      res.json({ success: true, user });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= PASSWORD =================
export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } =
        req.body as IUpdatePassword;

      const user = await userModel
        .findById(req.user?._id)
        .select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const match = await user.comparePassword(oldPassword);

      if (!match) {
        return next(new ErrorHandler("Wrong password", 400));
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);

// ================= ADD MEMBER =================
export const addTeamMember = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body as IAddMemberBody;

      const user = await userModel.findOne({ email });

      if (user) {
        user.role = role;
        await user.save();
        return res.json({ success: true, user });
      }

      const newUser = await userModel.create({
        email,
        role,
        name: email.split("@")[0],
        password: Math.random().toString(36).slice(-8),
      });

      res.status(201).json({ success: true, user: newUser });
    } catch (error: unknown) {
      return next(new ErrorHandler((error as Error).message, 400));
    }
  }
);