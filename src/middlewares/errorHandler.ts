import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export interface AppError extends Error {
  status?: number;
  errorCode?: number;
}

export interface ErrorResponse {
  message: string;
  errorCode?: number;
}

export function createErrorResponse(
  message: string,
  statusCode: number
): ErrorResponse {
  return {
    message: message,
    errorCode: statusCode,
  };
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(err);
  res.status(err.status || err.errorCode || 500).json({
    message: err.message || "Internal Server Error",
    ...(err.errorCode && { errorCode: err.errorCode }),
  });
};
