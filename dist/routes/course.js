"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CourseService_1 = require("../services/CourseService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const courseService = CourseService_1.CourseService.getInstance();
// Protected routes requiring authentication
router.post("/", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const course = await courseService.createCourse(req.body);
        res.status(201).json(course);
    }
    catch (err) {
        next(err);
    }
});
router.get("/", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [courses, total] = await courseService.getAllCoursesPaginated(skip, limit);
        res.json({
            courses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(parseInt(req.params.id));
        res.json(course);
    }
    catch (err) {
        next(err);
    }
});
router.get("/creator/:creatorId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const courses = await courseService.getCourseByCreator(parseInt(req.params.creatorId));
        res.json(courses);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const course = await courseService.updateCourse(parseInt(req.params.id), req.body);
        res.json(course);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const result = await courseService.deleteCourse(parseInt(req.params.id));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/content", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const content = await courseService.getCourseContent(parseInt(req.params.id));
        res.json(content);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
