"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuestionService_1 = require("../services/QuestionService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const questionService = QuestionService_1.QuestionService.getInstance();
// Tạo câu hỏi mới (ADMIN, TEACHER)
router.post("/", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const question = await questionService.createQuestion(req.body);
        res.status(201).json(question);
    }
    catch (err) {
        next(err);
    }
});
// Lấy tất cả câu hỏi với phân trang
router.get("/", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [questions, total] = await questionService.getAllQuestionsPaginated(skip, limit);
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
    }
    catch (err) {
        next(err);
    }
});
// Lấy câu hỏi theo creatorId với phân trang
router.get("/:creatorId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const creatorId = parseInt(req.params.creatorId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [questions, total] = await questionService.getQuestionsByCreatorPaginated(creatorId, skip, limit);
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
    }
    catch (err) {
        next(err);
    }
});
// Lấy câu hỏi theo ID
router.get("/details/:id", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const question = await questionService.getQuestionById(parseInt(req.params.id));
        res.json(question);
    }
    catch (err) {
        next(err);
    }
});
// Cập nhật câu hỏi (ADMIN, TEACHER)
router.put("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const question = await questionService.updateQuestion(parseInt(req.params.id), req.body);
        res.json(question);
    }
    catch (err) {
        next(err);
    }
});
// Xóa câu hỏi (ADMIN, TEACHER)
router.delete("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const result = await questionService.deleteQuestion(parseInt(req.params.id));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
