import { Router } from "express";
import { ChapterService } from "../services/ChapterService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const chapterService = ChapterService.getInstance();

// Protected routes requiring authentication
router.post("/course/:courseId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const chapter = await chapterService.createChapter(parseInt(req.params.courseId), req.body);
    res.status(201).json(chapter);
  } catch (err) {
    next(err);
  }
});

router.get("/course/:courseId", isAuthenticated(), async (req, res, next) => {
  try {
    const chapters = await chapterService.getChaptersByCourse(parseInt(req.params.courseId));
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", isAuthenticated(), async (req, res, next) => {
  try {
    const chapter = await chapterService.getChapterById(parseInt(req.params.id));
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(parseInt(req.params.id), req.body);
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await chapterService.deleteChapter(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/order", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const { order } = req.body;
    if (typeof order !== 'number') {
      throw new Error("Order must be a number");
    }
    const chapter = await chapterService.updateChapterOrder(parseInt(req.params.id), order);
    res.json(chapter);
  } catch (err) {
    next(err);
  }
});

export default router; 