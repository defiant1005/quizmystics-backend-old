import ApiError from "../error/ApiError.js";
import { Request, Response, NextFunction } from "express";

export default function ErrorHandlingMiddleware(err: Error, req: Request, res: Response, next: NextFunction): Response {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: "Непредвиденная ошибка!" });
}
