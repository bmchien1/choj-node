import { Request, Response, NextFunction } from "express";

const responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Ensure TypeORM objects are serialized correctly
    const formattedData = JSON.parse(JSON.stringify(data));
    return originalJson.call(this, formattedData);
  };

  next();
};

export default responseMiddleware;