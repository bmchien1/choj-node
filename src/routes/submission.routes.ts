import { Router } from "express";
import SubmissionController from "../controllers/SubmissionController";

const router = Router();

router.post("/api/submissions/:submissionId/questions/:questionId/evaluation-result", SubmissionController.handleEvaluationResult);

export default router; 