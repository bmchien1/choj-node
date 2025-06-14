"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const types_1 = require("../types");
const isAuthenticated = (roles = []) => {
    const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    return async (req, res, next) => {
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
        let decodedUser;
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
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
        if (userInDb.role === types_1.AppRole.ADMIN || roles.length === 0 || roles.includes(userInDb.role)) {
            req.user = userInDb; // Attach full user object to request
            return next();
        }
        return res.status(403).json({ error: "Insufficient permissions for this operation" });
    };
};
exports.default = isAuthenticated;
