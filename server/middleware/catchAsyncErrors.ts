import { NextFunction, Request, Response } from "express";

type AsyncFunc = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const CatchAsyncError =
  (theFunc: AsyncFunc) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };