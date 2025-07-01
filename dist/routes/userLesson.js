"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserLessonService_1 = __importDefault(require("../services/UserLessonService"));
const router = (0, express_1.Router)();
const userLessonService = UserLessonService_1.default.getInstance();
// Đánh dấu hoàn thành hoặc chưa hoàn thành
router.post("/mark", async (req, res, next) => {
    try {
        const { userId, lessonId, completed } = req.body;
        const result = await userLessonService.markCompleted(userId, lessonId, completed);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// Lấy danh sách lesson đã hoàn thành của user
router.get("/completed/:userId", async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const result = await userLessonService.getCompletedLessons(userId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// Kiểm tra lesson đã hoàn thành chưa
router.get("/is-completed", async (req, res, next) => {
    try {
        const { userId, lessonId } = req.query;
        const result = await userLessonService.isLessonCompleted(Number(userId), Number(lessonId));
        res.json({ completed: result });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
