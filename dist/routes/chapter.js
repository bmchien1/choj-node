"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ChapterService_1 = require("../services/ChapterService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const chapterService = ChapterService_1.ChapterService.getInstance();
router.post("/:courseId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const chapter = await chapterService.createChapter(parseInt(req.params.courseId), req.body);
        res.status(201).json(chapter);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:courseId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const chapters = await chapterService.getChaptersByCourse(parseInt(req.params.courseId));
        res.json(chapters);
    }
    catch (err) {
        next(err);
    }
});
router.get("/single/:chapterId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const chapter = await chapterService.getChapterById(parseInt(req.params.chapterId));
        res.json(chapter);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:chapterId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const chapter = await chapterService.updateChapter(parseInt(req.params.chapterId), req.body);
        res.json(chapter);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:chapterId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const result = await chapterService.deleteChapter(parseInt(req.params.chapterId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
