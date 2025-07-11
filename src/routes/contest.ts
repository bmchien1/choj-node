import { Router } from "express";
import ContestService from "../services/ContestService";
import { ContestAttemptService } from "../services/ContestAttemptService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const contestService = ContestService.getInstance();
const attemptService = ContestAttemptService.getInstance();

// Create a new contest (Teacher only)
router.post("/", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { title, description, isPublic, startTime, endTime, duration, userId, questions_scores } = req.body;

        const contest = await contestService.createContest(
            title,
            description,
            isPublic,
            new Date(startTime),
            new Date(endTime),
            duration,
            userId,
            questions_scores
        );

        res.json(contest);
    } catch (error) {
        next(error);
    }
});

// Get all public contests
router.get("/public", async (req, res, next) => {
    try {
        const contests = await contestService.getPublicContests();
        res.json(contests);
    } catch (error) {
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
    } catch (error) {
        next(error);
    }
});

// Get attempts by user and contest
router.get("/:contestId/attempts", isAuthenticated(), async (req, res, next) => {
    try {
        const attempts = await attemptService.getAttemptsByUserAndContest(
            parseInt(req.query.userId as string),
            parseInt(req.params.contestId)
        );
        res.json(attempts);
    } catch (err) {
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
    } catch (error) {
        next(error);
    }
});

// Get contests created by a teacher
router.get("/teacher/:teacherId", async (req, res, next) => {
    try {
        const contests = await contestService.getContestsByCreator(Number(req.params.teacherId));
        res.json(contests);
    } catch (error) {
        next(error);
    }
});

// Update contest
router.put("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { title, description, isPublic, startTime, endTime, duration, userId, questions_scores } = req.body;

        const contest = await contestService.updateContest(
            Number(req.params.id),
            title,
            description,
            isPublic,
            new Date(startTime),
            new Date(endTime),
            duration,
            userId,
            questions_scores
        );

        res.json(contest);
    } catch (error) {
        next(error);
    }
});

// Delete contest
router.delete("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;

        await contestService.deleteContest(
            Number(req.params.id),
            userId
        );
        res.json({ message: "Contest deleted successfully" });
    } catch (error) {
        next(error);
    }
});

// Add question to contest
router.post("/:contestId/questions/:questionId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;

        const contest = await contestService.addQuestionToContest(
            Number(req.params.contestId),
            Number(req.params.questionId),
            userId
        );
        res.json(contest);
    } catch (error) {
        next(error);
    }
});

// Remove question from contest
router.delete("/:contestId/questions/:questionId", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { userId } = req.body;

        const contest = await contestService.removeQuestionFromContest(
            Number(req.params.contestId),
            Number(req.params.questionId),
            userId
        );
        res.json(contest);
    } catch (error) {
        next(error);
    }
});

// Add questions to contest by matrix
router.post("/:contestId/add-questions-by-matrix", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
    try {
        const { matrixId, userId } = req.body;
        const contest = await contestService.addQuestionsByMatrix(
            Number(req.params.contestId),
            Number(matrixId),
            Number(userId)
        );
        res.json(contest);
    } catch (error) {
        next(error);
    }
});

// New routes for contest attempts
router.post("/:contestId/start", isAuthenticated(), async (req, res, next) => {
  try {
    const contest = await contestService.getContestById(parseInt(req.params.contestId));
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    const attempt = await attemptService.startAttempt(parseInt(req.body.userId), contest);
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

router.get("/:contestId/attempt", isAuthenticated(), async (req, res, next) => {
  try {
    const attempt = await attemptService.getActiveAttempt(
      parseInt(req.query.userId as string),
      parseInt(req.params.contestId)
    );
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

router.put("/attempt/:attemptId/answers", isAuthenticated(), async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await attemptService.saveTemporaryAnswers(parseInt(req.params.attemptId), answers);
    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

router.get("/attempt/:attemptId/answers", isAuthenticated(), async (req, res, next) => {
  try {
    const answers = await attemptService.getTemporaryAnswers(parseInt(req.params.attemptId));
    res.json(answers);
  } catch (err) {
    next(err);
  }
});

export default router; 