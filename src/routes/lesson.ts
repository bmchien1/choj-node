import { Router } from "express";
import { LessonService } from "../services/LessonService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const lessonService = LessonService.getInstance();

router.post("/:courseId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(parseInt(req.params.courseId), req.body);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
});

router.get("/:courseId", isAuthenticated(), async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessonsByCourse(parseInt(req.params.courseId));
    res.json(lessons);
  } catch (err) {
    next(err);
  }
});

router.get("/chapter/:chapterId", isAuthenticated(), async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessonsByChapter(parseInt(req.params.chapterId));
    res.json(lessons);
  } catch (err) {
    next(err);
  }
});

router.get("/single/:lessonId", isAuthenticated(), async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(parseInt(req.params.lessonId));
    res.json(lesson);
  } catch (err) {
    next(err);
  }
});

router.put("/:lessonId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(parseInt(req.params.lessonId), req.body);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
});

router.delete("/:lessonId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await lessonService.deleteLesson(parseInt(req.params.lessonId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;