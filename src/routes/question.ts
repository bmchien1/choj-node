import { Router } from "express";
import { QuestionService } from "../services/QuestionService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const questionService = QuestionService.getInstance();

// Tạo câu hỏi mới (ADMIN, TEACHER)
router.post("/", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// Lấy tất cả câu hỏi với phân trang
router.get("/", isAuthenticated(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',').map(Number) : undefined;

    const [questions, total] = await questionService.getAllQuestionsPaginated(
      skip,
      limit,
      search,
      sortField,
      sortOrder,
      difficulty,
      type,
      tags
    );
    res.json({
      questions: questions.map((question) => ({
        id: question.id,
        questionName: question.questionName,
        questionType: question.questionType,
        question: question.question,
        difficulty_level: question.difficulty_level,
        creatorName: question.creator?.email ?? 'Unknown',
        tags: (question.tags ?? []).map(tag => ({
          id: tag.id,
          name: tag.name,
          creatorId: tag.creator?.id ?? 0,
          creatorName: tag.creator?.email ?? 'Unknown',
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Lấy câu hỏi theo creatorId với phân trang
router.get("/:creatorId", isAuthenticated(), async (req, res, next) => {
  try {
    const creatorId = parseInt(req.params.creatorId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',').map(Number) : undefined;

    const [questions, total] = await questionService.getQuestionsByCreatorPaginated(
      creatorId,
      skip,
      limit,
      search,
      sortField,
      sortOrder,
      difficulty,
      type,
      tags
    );
    res.json({
      questions: questions.map((question) => ({
        id: question.id,
        questionName: question.questionName,
        questionType: question.questionType,
        question: question.question,
        difficulty_level: question.difficulty_level,
        creatorName: question.creator?.email ?? 'Unknown',
        tags: (question.tags ?? []).map(tag => ({
          id: tag.id,
          name: tag.name,
          creatorId: tag.creator?.id ?? 0,
          creatorName: tag.creator?.email ?? 'Unknown',
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Lấy câu hỏi theo ID
router.get("/details/:id", isAuthenticated(), async (req, res, next) => {
  try {
    const question = await questionService.getQuestionById(parseInt(req.params.id));
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// Cập nhật câu hỏi (ADMIN, TEACHER)
router.put("/:id", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const question = await questionService.updateQuestion(parseInt(req.params.id), req.body);
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// Xóa câu hỏi (ADMIN, TEACHER)
router.delete("/:id", isAuthenticated([AppRole.ADMIN, AppRole.TEACHER]), async (req, res, next) => {
  try {
    const result = await questionService.deleteQuestion(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;