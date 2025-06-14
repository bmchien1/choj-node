import { Request, Response, NextFunction } from "express";

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  // Handle custom thrown errors (UNKNOWN)
  if (err instanceof Error) {
    return res.status(400).json({
      message: err.message,
      status: 400,
    });
  }

  // Handle internal server errors or parsing issues
  if (err.code === "INTERNAL_SERVER_ERROR" || err.code === "PARSE") {
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      status: 500,
    });
  }

  // Handle validation errors
  if (err.code === "VALIDATION") {
    return res.status(400).json({
      message: err.message || "Validation Error",
      status: 400,
    });
  }

  // Handle not found errors
  if (err.code === "NOT_FOUND") {
    return res.status(404).json({
      message: err.message || "Not Found",
      status: 404,
    });
  }

  // Default to 500 for unhandled errors
  return res.status(500).json({
    message: err.message || "Unexpected Error",
    status: 500,
  });
};

export default errorMiddleware;