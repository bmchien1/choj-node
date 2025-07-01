"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SubmissionService_1 = __importDefault(require("../services/SubmissionService"));
const SubmissionController_1 = __importDefault(require("../controllers/SubmissionController"));
const router = (0, express_1.Router)();
const submissionService = SubmissionService_1.default.getInstance();
// Build code with custom input
router.post("/build", async (req, res, next) => {
    try {
        const { language, sourceCode, input } = req.body;
        if (!language || !sourceCode || input === undefined) {
            return res.status(400).json({ error: "language, sourceCode, and input are required" });
        }
        console.log('Building code request:', { language, sourceCode, input });
        // Set a timeout for the entire build process
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Build request timed out')), 30000);
        });
        const buildPromise = submissionService.buildCode(language, sourceCode, input);
        const result = await Promise.race([buildPromise, timeoutPromise]);
        console.log('Build result:', result);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Build code error:', err);
        if (err.message === 'Build request timed out') {
            return res.status(408).json({ error: "Build request timed out. Please try again." });
        }
        next(err);
    }
});
// Handle evaluation result callback
router.post("/:submissionId/questions/:questionId/evaluation-result", SubmissionController_1.default.handleEvaluationResult);
// Submit assignment
router.post("/", async (req, res, next) => {
    try {
        const { userId, assignmentId, testId, answers } = req.body;
        if (!userId || !answers) {
            return res.status(400).json({ error: "userId and answers are required" });
        }
        const result = await submissionService.submitAssignment(userId, assignmentId, testId, answers);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
});
// Get submissions by assignment ID
router.get("/assignment/:assignmentId", async (req, res, next) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        if (isNaN(assignmentId)) {
            return res.status(400).json({ error: "Invalid assignmentId" });
        }
        const submissions = await submissionService.getSubmissionsByAssignment(assignmentId);
        res.json(submissions);
    }
    catch (err) {
        next(err);
    }
});
// Get submissions by assignment ID and user ID
router.get("/assignment/:assignmentId/user/:userId", async (req, res, next) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const userId = parseInt(req.params.userId);
        if (isNaN(assignmentId) || isNaN(userId)) {
            return res.status(400).json({ error: "Invalid assignmentId or userId" });
        }
        const submissions = await submissionService.getSubmissionsByAssignmentAndUser(assignmentId, userId);
        res.json(submissions);
    }
    catch (err) {
        next(err);
    }
});
// Lấy tất cả submissions của user cho course
router.get("/all-by-course-user", async (req, res, next) => {
    try {
        const { courseId, userId } = req.query;
        // console.log(courseId);
        // console.log(userId);
        const result = await submissionService.getAllByCourseAndUser(Number(courseId), Number(userId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// Get submission by ID
router.get("/:submissionId", async (req, res, next) => {
    try {
        const submissionId = parseInt(req.params.submissionId);
        if (isNaN(submissionId)) {
            return res.status(400).json({ error: "Invalid submissionId" });
        }
        const submission = await submissionService.getSubmissionById(submissionId);
        res.json(submission);
    }
    catch (err) {
        next(err);
    }
});
// Get submissions by course ID
router.get("/course/:courseId", async (req, res, next) => {
    try {
        const courseId = parseInt(req.params.courseId);
        if (isNaN(courseId)) {
            return res.status(400).json({ error: "Invalid courseId" });
        }
        const submissions = await submissionService.getSubmissionsByCourse(courseId);
        res.json(submissions);
    }
    catch (err) {
        next(err);
    }
});
// Get submissions by contest ID
router.get("/contest/:contestId", async (req, res, next) => {
    try {
        const contestId = parseInt(req.params.contestId);
        if (isNaN(contestId)) {
            return res.status(400).json({ error: "Invalid contestId" });
        }
        const submissions = await submissionService.getSubmissionsByContest(contestId);
        res.json(submissions);
    }
    catch (err) {
        next(err);
    }
});
// Get all submissions (admin only)
router.get("/", async (req, res, next) => {
    try {
        const submissions = await submissionService.getAllSubmissions();
        res.json(submissions);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
