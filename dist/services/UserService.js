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
exports.UserService = void 0;
const User_1 = require("../entities/User");
const data_source_1 = require("../data-source");
const bcrypt = __importStar(require("bcrypt"));
const types_1 = require("../types");
const jwt = __importStar(require("jsonwebtoken"));
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    async register(body) {
        const emailLowerCase = body.email.toLowerCase();
        const existUser = await this.userRepository.findOneBy({ email: emailLowerCase });
        if (existUser) {
            throw new Error("User already exists");
        }
        const user = new User_1.User();
        user.role = types_1.AppRole.USER;
        user.email = emailLowerCase;
        user.password = bcrypt.hashSync(body.password, 10);
        const savedUser = await this.userRepository.save(user);
        return savedUser.toApiResponse();
    }
    async login(body) {
        const emailToLower = body.email.toLowerCase();
        const user = await this.userRepository.findOneBy({ email: emailToLower });
        if (!user) {
            throw new Error("User not found");
        }
        if (!bcrypt.compareSync(body.password, user.password)) {
            throw new Error("Password is incorrect");
        }
        const accessToken = jwt.sign({ id: user.id, email: emailToLower, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = (0, uuid_1.v4)();
        user.refresh_token = refreshToken;
        user.access_token = accessToken;
        await this.userRepository.save(user);
        return {
            jwt: accessToken,
            refreshToken,
            user: user.toApiResponse(),
        };
    }
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error("Refresh token is required");
        }
        const user = await this.userRepository.findOneBy({ refresh_token: refreshToken });
        if (!user || !user.refresh_token) {
            throw new Error("Invalid or expired refresh token");
        }
        const tokenAge = Date.now() - new Date(user.updatedAt).getTime();
        if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
            user.access_token = undefined;
            user.refresh_token = undefined;
            await this.userRepository.save(user);
            throw new Error("Refresh token has expired");
        }
        const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const newRefreshToken = (0, uuid_1.v4)();
        user.access_token = newAccessToken;
        user.refresh_token = newRefreshToken;
        await this.userRepository.save(user);
        return {
            jwt: newAccessToken,
            refreshToken: newRefreshToken,
            user: user.toApiResponse(),
        };
    }
    async logout(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error("User not found");
        }
        user.access_token = undefined;
        user.refresh_token = undefined;
        await this.userRepository.save(user);
        return { message: "Logged out successfully" };
    }
    async changePassword(user, body) {
        if (!bcrypt.compareSync(body.oldPassword, user.password)) {
            throw new Error("Old password is incorrect");
        }
        user.password = bcrypt.hashSync(body.newPassword, 10);
        const savedUser = await this.userRepository.save(user);
        return savedUser.toApiResponse();
    }
    async updateAdmin(body) {
        const user = await this.userRepository.findOneBy({ id: body.userId });
        if (!user) {
            throw new Error("User not found");
        }
        if (body.role && !Object.values(types_1.AppRole).includes(body.role)) {
            throw new Error("Invalid role");
        }
        if (body.role) {
            user.role = body.role;
        }
        const savedUser = await this.userRepository.save(user);
        return savedUser.toApiResponse();
    }
    async getOne(query = {}) {
        const user = await this.userRepository.findOneBy(query);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async getAll(query = {}) {
        return await this.userRepository.find();
    }
    async countUsers() {
        return this.userRepository.count();
    }
    async getTopUsers(limit = 10) {
        const users = await this.userRepository.createQueryBuilder("user")
            .orderBy("user.totalScore", "DESC")
            .addOrderBy("user.totalSolved", "DESC")
            .limit(limit)
            .getMany();
        return users.map(user => ({
            id: user.id,
            email: user.email,
            totalScore: user.totalScore,
            totalSolved: user.totalSolved,
        }));
    }
}
exports.UserService = UserService;
