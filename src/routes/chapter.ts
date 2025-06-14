import { Router } from "express";
import { ChapterService } from "../services/ChapterService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const chapterService = ChapterService.getInstance();

router.post("/:courseId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const chapter = await chapterService.createChapter(parseInt(req.params.courseId), req.body);
    res.status(201).json(chapter);
  } catch (err) {
    next(err);
  }
});

router.get("/:courseId", isAuthenticated(), async (req, res, next) => {
  try {
    const chapters = await chapterService.getChaptersByCourse(parseInt(req.params.courseId));
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});

router.get("/single/:chapterId", isAuthenticated(), async (req, res, next) => {
  try {
    const chapter = await chapterService.getChapterById(parseInt(req.params.chapterId));
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

router.put("/:chapterId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(parseInt(req.params.chapterId), req.body);
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

router.delete("/:chapterId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await chapterService.deleteChapter(parseInt(req.params.chapterId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router; 