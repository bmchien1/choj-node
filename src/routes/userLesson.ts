import { Router } from "express";
import UserLessonService from "../services/UserLessonService";

const router = Router();
const userLessonService = UserLessonService.getInstance();

// Đánh dấu hoàn thành hoặc chưa hoàn thành
router.post("/mark", async (req, res, next) => {
  try {
    const { userId, lessonId, completed } = req.body;
    const result = await userLessonService.markCompleted(userId, lessonId, completed);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Lấy danh sách lesson đã hoàn thành của user
router.get("/completed/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await userLessonService.getCompletedLessons(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Kiểm tra lesson đã hoàn thành chưa
router.get("/is-completed", async (req, res, next) => {
  try {
    const { userId, lessonId } = req.query;
    const result = await userLessonService.isLessonCompleted(Number(userId), Number(lessonId));
    res.json({ completed: result });
  } catch (err) {
    next(err);
  }
});

export default router; 