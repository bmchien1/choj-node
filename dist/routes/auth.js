"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserService_1 = require("../services/UserService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const userService = UserService_1.UserService.getInstance();
// Đăng ký người dùng
router.post("/register", async (req, res, next) => {
    try {
        const user = await userService.register(req.body);
        res.status(201).json(user);
    }
    catch (err) {
        next(err);
    }
});
// Đăng nhập
router.post("/login", async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.json(result);
    }
    catch (err) {
        // Friendly error for user login
        if (err.message === "User not found" ||
            err.message === "Password is incorrect") {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        next(err);
    }
});
// Làm mới token
router.post("/refresh-token", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await userService.refreshToken(refreshToken);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// Đăng xuất
router.post("/logout", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const user = req.user;
        const result = await userService.logout(user.id);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// Đổi mật khẩu
router.post("/change-password", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const user = req.user;
        const updatedUser = await userService.changePassword(user, req.body);
        res.json(updatedUser);
    }
    catch (err) {
        next(err);
    }
});
// Lấy thông tin người dùng hiện tại
router.get("/me", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const user = req.user;
        res.json(user.toApiResponse());
    }
    catch (err) {
        next(err);
    }
});
// Lấy tất cả người dùng (ADMIN)
router.get("/users", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const users = await userService.getAll(req.query);
        res.json(users);
    }
    catch (err) {
        next(err);
    }
});
// Lấy người dùng theo ID (ADMIN)
router.get("/user/:id", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const user = await userService.getOne({ id: parseInt(req.params.id) });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
// Cập nhật thông tin người dùng (ADMIN)
router.put("/update-user", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId, role } = req.body;
        const updatedUser = await userService.updateAdmin({ userId, role });
        res.json(updatedUser);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
