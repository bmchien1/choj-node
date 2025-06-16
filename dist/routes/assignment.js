"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AssignmentService_1 = __importDefault(require("../services/AssignmentService"));
const AssignmentAttemptService_1 = require("../services/AssignmentAttemptService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const assignmentService = AssignmentService_1.default.getInstance();
const attemptService = AssignmentAttemptService_1.AssignmentAttemptService.getInstance();
router.post("/:courseId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const assignment = await assignmentService.createAssignment(parseInt(req.params.courseId), {
            ...req.body,
            question_scores: req.body.question_scores,
            total_points: req.body.total_points,
        });
        res.status(201).json(assignment);
    }
    catch (err) {
        next(err);
    }
});
router.post("/matrix/:courseId/:matrixId/:userId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { courseId, matrixId, userId } = req.params;
        const assignment = await assignmentService.createAssignmentFromMatrix(parseInt(courseId), parseInt(matrixId), parseInt(userId), req.body);
        res.status(201).json(assignment);
    }
    catch (err) {
        next(err);
    }
});
router.get("/matrix/check/:courseId/:matrixId/:userId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { courseId, matrixId, userId } = req.params;
        const result = await assignmentService.checkMatrixAssignment(parseInt(courseId), parseInt(matrixId), parseInt(userId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:courseId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const assignments = await assignmentService.getAssignmentsByCourse(parseInt(req.params.courseId));
        res.json(assignments);
    }
    catch (err) {
        next(err);
    }
});
router.get("/chapter/:chapterId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const assignments = await assignmentService.getAssignmentsByChapter(parseInt(req.params.chapterId));
        res.json(assignments);
    }
    catch (err) {
        next(err);
    }
});
router.get("/single/:assignmentId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const assignment = await assignmentService.getAssignmentById(parseInt(req.params.assignmentId));
        res.json(assignment);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:assignmentId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const assignment = await assignmentService.updateAssignment(parseInt(req.params.assignmentId), req.body);
        res.json(assignment);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:assignmentId", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const result = await assignmentService.deleteAssignment(parseInt(req.params.assignmentId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
// New routes for assignment attempts
router.post("/:assignmentId/start", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const assignment = await assignmentService.getAssignmentById(parseInt(req.params.assignmentId));
        const attempt = await attemptService.startAttempt(parseInt(req.body.userId), assignment);
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
router.get("/:assignmentId/attempt", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const attempt = await attemptService.getActiveAttempt(parseInt(req.query.userId), parseInt(req.params.assignmentId));
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
exports.default = router;
