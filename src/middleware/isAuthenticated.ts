import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AppRole } from "../types";

interface DecodedToken {
  id: number;
  email: string;
  role: AppRole;
  iat: number;
  exp: number;
}

const isAuthenticated = (roles: AppRole[] = []) => {
  const userRepository = AppDataSource.getRepository(User);

  return async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers["authorization"];

    if (!authorization) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Bearer token is missing" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ error: "Internal server error: Authentication configuration missing" });
    }

    let decodedUser: DecodedToken;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: "Token has expired" });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ error: "Invalid token format or signature" });
      }
      console.error("Token verification error:", error);
      return res.status(403).json({ error: "Token verification failed" });
    }

    const userInDb = await userRepository.findOneBy({ id: decodedUser.id });
    if (!userInDb) {
      return res.status(404).json({ error: "User associated with token not found" });
    }

    if (userInDb.role === AppRole.ADMIN || roles.length === 0 || roles.includes(userInDb.role)) {
      (req as any).user = userInDb; // Attach full user object to request
      return next();
    }

    return res.status(403).json({ error: "Insufficient permissions for this operation" });
  };
};

export default isAuthenticated;