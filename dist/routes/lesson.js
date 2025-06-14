"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LessonService_1 = require("../services/LessonService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const lessonService = LessonService_1.LessonService.getInstance();
router.post("/:courseId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const lesson = await lessonService.createLesson(parseInt(req.params.courseId), req.body);
        res.status(201).json(lesson);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:courseId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const lessons = await lessonService.getLessonsByCourse(parseInt(req.params.courseId));
        res.json(lessons);
    }
    catch (err) {
        next(err);
    }
});
router.get("/chapter/:chapterId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const lessons = await lessonService.getLessonsByChapter(parseInt(req.params.chapterId));
        res.json(lessons);
    }
    catch (err) {
        next(err);
    }
});
router.get("/single/:lessonId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const lesson = await lessonService.getLessonById(parseInt(req.params.lessonId));
        res.json(lesson);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:lessonId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const lesson = await lessonService.updateLesson(parseInt(req.params.lessonId), req.body);
        res.json(lesson);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:lessonId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const result = await lessonService.deleteLesson(parseInt(req.params.lessonId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
