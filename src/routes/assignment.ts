import { Router } from "express";
import  AssignmentService  from "../services/AssignmentService";
import { AssignmentAttemptService } from "../services/AssignmentAttemptService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const assignmentService = AssignmentService.getInstance();
const attemptService = AssignmentAttemptService.getInstance();

router.post("/:courseId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(parseInt(req.params.courseId), {
      ...req.body,
      question_scores: req.body.question_scores,
      total_points: req.body.total_points,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

router.post("/matrix/:courseId/:matrixId/:userId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const { courseId, matrixId, userId } = req.params;
    const assignment = await assignmentService.createAssignmentFromMatrix(
      parseInt(courseId),
      parseInt(matrixId),
      parseInt(userId),
      req.body
    );
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

router.get("/matrix/check/:courseId/:matrixId/:userId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const { courseId, matrixId, userId } = req.params;
    const result = await assignmentService.checkMatrixAssignment(
      parseInt(courseId),
      parseInt(matrixId),
      parseInt(userId)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:courseId", isAuthenticated(), async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAssignmentsByCourse(parseInt(req.params.courseId));
    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

router.get("/chapter/:chapterId", isAuthenticated(), async (req, res, next) => {
  try {
    const assignments = await assignmentService.getAssignmentsByChapter(parseInt(req.params.chapterId));
    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

router.get("/single/:assignmentId", isAuthenticated(), async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(parseInt(req.params.assignmentId));
    res.json(assignment);
  } catch (err) {
    next(err);
  }
});

router.put("/:assignmentId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(parseInt(req.params.assignmentId), req.body);
    res.json(assignment);
  } catch (err) {
    next(err);
  }
});

router.delete("/:assignmentId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await assignmentService.deleteAssignment(parseInt(req.params.assignmentId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// New routes for assignment attempts
router.post("/:assignmentId/start", isAuthenticated(), async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(parseInt(req.params.assignmentId));
    const attempt = await attemptService.startAttempt(parseInt(req.body.userId), assignment);
    res.status(201).json(attempt);
  } catch (err) {
    next(err);
  }
});

router.put("/attempt/:attemptId/active", isAuthenticated(), async (req, res, next) => {
  try {
    const attempt = await attemptService.updateLastActiveTime(parseInt(req.params.attemptId));
    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

router.put("/attempt/:attemptId/submit", isAuthenticated(), async (req, res, next) => {
  try {
    const attempt = await attemptService.submitAttempt(parseInt(req.params.attemptId));
    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

router.get("/:assignmentId/attempt", isAuthenticated(), async (req, res, next) => {
  try {
    const attempt = await attemptService.getActiveAttempt(parseInt(req.query.userId as string), parseInt(req.params.assignmentId));
    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

router.put("/attempt/:attemptId/time", isAuthenticated(), async (req, res, next) => {
  try {
    const { timeLeft } = req.body;
    const attempt = await attemptService.updateTimeLeft(parseInt(req.params.attemptId), timeLeft);
    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

export default router;