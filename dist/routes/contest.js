"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ContestService_1 = __importDefault(require("../services/ContestService"));
const ContestAttemptService_1 = require("../services/ContestAttemptService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const contestService = ContestService_1.default.getInstance();
const attemptService = ContestAttemptService_1.ContestAttemptService.getInstance();
// Create a new contest (Teacher only)
router.post("/", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { title, description, isPublic, startTime, endTime, duration, userId, questions_scores } = req.body;
        const contest = await contestService.createContest(title, description, isPublic, new Date(startTime), new Date(endTime), duration, userId, questions_scores);
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Get all public contests
router.get("/public", async (req, res, next) => {
    try {
        const contests = await contestService.getPublicContests();
        res.json(contests);
    }
    catch (error) {
        next(error);
    }
});
// Get contest by access URL (for private contests)
router.get("/access/:url", async (req, res, next) => {
    try {
        const contest = await contestService.getContestByUrl(req.params.url);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Get attempts by user and contest
router.get("/:contestId/attempts", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const attempts = await attemptService.getAttemptsByUserAndContest(parseInt(req.query.userId), parseInt(req.params.contestId));
        res.json(attempts);
    }
    catch (err) {
        next(err);
    }
});
// Get contest by ID
router.get("/:id", async (req, res, next) => {
    try {
        const contest = await contestService.getContestById(Number(req.params.id));
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Get contests created by a teacher
router.get("/teacher/:teacherId", async (req, res, next) => {
    try {
        const contests = await contestService.getContestsByCreator(Number(req.params.teacherId));
        res.json(contests);
    }
    catch (error) {
        next(error);
    }
});
// Update contest
router.put("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { title, description, isPublic, startTime, endTime, duration, userId, questions_scores } = req.body;
        const contest = await contestService.updateContest(Number(req.params.id), title, description, isPublic, new Date(startTime), new Date(endTime), duration, userId, questions_scores);
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Delete contest
router.delete("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;
        await contestService.deleteContest(Number(req.params.id), userId);
        res.json({ message: "Contest deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// Add question to contest
router.post("/:contestId/questions/:questionId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;
        const contest = await contestService.addQuestionToContest(Number(req.params.contestId), Number(req.params.questionId), userId);
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Remove question from contest
router.delete("/:contestId/questions/:questionId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;
        const contest = await contestService.removeQuestionFromContest(Number(req.params.contestId), Number(req.params.questionId), userId);
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// Add questions to contest by matrix
router.post("/:contestId/add-questions-by-matrix", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { matrixId, userId } = req.body;
        const contest = await contestService.addQuestionsByMatrix(Number(req.params.contestId), Number(matrixId), Number(userId));
        res.json(contest);
    }
    catch (error) {
        next(error);
    }
});
// New routes for contest attempts
router.post("/:contestId/start", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const contest = await contestService.getContestById(parseInt(req.params.contestId));
        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }
        const attempt = await attemptService.startAttempt(parseInt(req.body.userId), contest);
        res.status(201).json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.put("/attempt/:attemptId/active", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const attempt = await attemptService.updateLastActiveTime(parseInt(req.params.attemptId));
        res.json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.put("/attempt/:attemptId/submit", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const attempt = await attemptService.submitAttempt(parseInt(req.params.attemptId));
        res.json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:contestId/attempt", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const attempt = await attemptService.getActiveAttempt(parseInt(req.query.userId), parseInt(req.params.contestId));
        res.json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.put("/attempt/:attemptId/time", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const { timeLeft } = req.body;
        const attempt = await attemptService.updateTimeLeft(parseInt(req.params.attemptId), timeLeft);
        res.json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.put("/attempt/:attemptId/answers", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const { answers } = req.body;
        const attempt = await attemptService.saveTemporaryAnswers(parseInt(req.params.attemptId), answers);
        res.json(attempt);
    }
    catch (err) {
        next(err);
    }
});
router.get("/attempt/:attemptId/answers", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const answers = await attemptService.getTemporaryAnswers(parseInt(req.params.attemptId));
        res.json(answers);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
