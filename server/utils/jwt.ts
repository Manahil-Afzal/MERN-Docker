import { Response } from "express";
import { IUser } from "../models/user.model.js";
import { redis } from "./redis.js";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// parse environment variables with fallback values
export const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

// default cookie options
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(
    Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000
  ),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // upload session to redis
  void redis
    .set(String(user._id), JSON.stringify(user))
    .catch((error: Error) => {
      console.error(
        "Failed to store session in Redis:",
        error.message
      );
    });

  const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "300",
    10
  );

  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "1200",
    10
  );

  const accessTokenOptions: ITokenOptions = {
    expires: new Date(
      Date.now() + accessTokenExpire * 60 * 60 * 1000
    ),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(
      Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000
    ),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  // only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  const safeUser = user.toObject() as Record<string, unknown>;
  delete safeUser.password;

  res.cookie(
    "access_token",
    accessToken,
    accessTokenOptions
  );

  res.cookie(
    "refresh_token",
    refreshToken,
    refreshTokenOptions
  );

  res.status(statusCode).json({
    success: true,
    user: safeUser,
    accessToken,
    refreshToken,
  });
};