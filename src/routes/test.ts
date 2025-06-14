import { Router } from "express";
import { TestService } from "../services/TestService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const testService = TestService.getInstance();

// Tạo bài kiểm tra mới (ADMIN, TEACHER)
router.post("/contest", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const test = await testService.createTest(req.body);
    res.status(201).json(test);
  } catch (err) {
    next(err);
  }
});

// Lấy tất cả bài kiểm tra
router.get("/contest", async (req, res, next) => {
  try {
    const tests = await testService.getAllTests(req.query);
    res.json(tests);
  } catch (err) {
    next(err);
  }
});

// Lấy bài kiểm tra theo ID
router.get("/contest/:id", async (req, res, next) => {
  try {
    const test = await testService.getTestById(parseInt(req.params.id));
    res.json(test);
  } catch (err) {
    next(err);
  }
});

// Cập nhật bài kiểm tra (ADMIN, TEACHER)
router.put("/contest/:id", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const test = await testService.updateTest(parseInt(req.params.id), req.body);
    res.json(test);
  } catch (err) {
    next(err);
  }
});

// Xóa bài kiểm tra (ADMIN, TEACHER)
router.delete("/contest/:id", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const result = await testService.deleteTest(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;