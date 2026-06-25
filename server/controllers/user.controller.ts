import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { IUser } from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import sendMail from "../utils/sendMail.js";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt.js";
import { redis } from "../utils/redis.js";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service.js";
import cloudinary from "cloudinary";
import connectDB from "../utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const isEmailExist = await userModel.findOne({ email });

    if (isEmailExist && isEmailExist.isVerified) {
      return next(new ErrorHandler("Email already exist", 400))
    };

    const user: IRegistrationBody = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };

    const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });
      res.status(201).json({
        success: true,
        message: `please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400))
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
});

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const activationTokenExpiresIn = (process.env.ACTIVATION_TOKEN_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

  const token = jwt.sign({
    user, activationCode
  },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: activationTokenExpiresIn,
    });
  return { token, activationCode };
};

//activate user
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activation_token, activation_code } = req.body as IActivationRequest;

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode: string };

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }
    const { name, email, password } = newUser.user;

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
      await userModel.create({
        name,
        email,
        password,
        isVerified: true,
      });
    }

    res.status(201).json({
      success: true,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
})

// login user
interface ILoginRequest {
  email: string,
  password: string;
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { email, password } = req.body as ILoginRequest;
    if (!email || !password) {
      return next(new ErrorHandler("please enter email and password", 400));
    };

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    };

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    sendToken(user, 200, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


// logout user
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });
    const userId = req.user?._id || '';
    redis.del(String(userId));

    res.status(200).json({
      success: true,
      message: "Logged out Successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


// update access token
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh_token =
      (req.cookies?.refresh_token as string | undefined) ||
      (req.body?.refresh_token as string | undefined);

    if (!refresh_token) {
      return next(new ErrorHandler("Refresh token is required", 400));
    }

    const decoded = jwt.verify(refresh_token,
      process.env.REFRESH_TOKEN as string) as JwtPayload;

    const message = 'Could not refresh token';
    if (!decoded) {
      return next(new ErrorHandler(message, 400));
    }
    const session = await redis.get(decoded.id as string);

    if (!session) {
      return next(new ErrorHandler("please login for access this resources!", 400));
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: "5m",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN as string,
      {
        expiresIn: "3d",
      }
    );

    req.user = user;
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    await redis.set(user._id, JSON.stringify(user), "EX", 604800) // 7 days

    if (req.path === "/refresh" && req.method === "GET") {
      return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
      });
    }

    next();
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }
      getUserById(userId.toString(), res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

// social auth
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    await connectDB();

    const { email, name, avatar } = req.body as ISocialAuthBody;

    const user = await userModel.findOne({ email });

    if (!user) {
      const newUser = await userModel.create({
        email,
        name,
        avatar: { public_id: "", url: avatar },
      });
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  }
);

// Update user Info
interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as IUpdateUserInfo;
    const userId = req.user?._id;
    const user = await userModel.findById(userId);

    if (name && user) {
      user.name = name;
    }

    await user?.save();

    await redis.set(String(userId), JSON.stringify(user));

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// update  user password 
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("please enter old and new password", 400))
      }

      const user = await userModel.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      user.password = newPassword;

      await user.save();

      await redis.set(String(req.user!._id), JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });


interface IUpdateProfilePicture {
  avatar: string;
}

// update profile picture 
export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;

      const userId = req.user?._id;

      const user = await userModel.findById(userId);

      if (avatar && user) {
        // if user have one avatar then call this if 
        if (user?.avatar?.public_id) {
          // first delete the old avatar
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          }
        }
      }

      await user?.save();

      await redis.set(String(userId), JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });


// get all users ---only for admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  });


// update user role --only for admin
export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = req.body;
    updateUserRoleService(res, id, role);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

interface IAddMemberBody {
  email: string;
  role: "admin" | "user";
}

export const addTeamMember = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body as IAddMemberBody;

    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
    }

    if (!["admin", "user"].includes(role)) {
      return next(new ErrorHandler("Role must be admin or user", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      existingUser.role = role;
      existingUser.isVerified = true;
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "Member updated successfully",
        user: existingUser,
      });
    }

    const generatedPassword = Math.random().toString(36).slice(-10);
    const generatedName = normalizedEmail.split("@")[0] || "New Member";

    const newUser = await userModel.create({
      name: generatedName,
      email: normalizedEmail,
      password: generatedPassword,
      role,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      user: newUser,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});


// delete user --only for admin
export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not Found", 404));
    }
    await user.deleteOne();

    await redis.del(String(id));

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});