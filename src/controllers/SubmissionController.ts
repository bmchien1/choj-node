import { Request, Response } from "express";
import SubmissionService from "../services/SubmissionService";

class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = SubmissionService.getInstance();
  }

  public handleEvaluationResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId, questionId } = req.params;
      const { results, score, error } = req.body;

      // Extract only the needed fields
      const evaluationResult = {
        results: results as any[],
        score,
        ...(error && { error })
      };

      const submission = await this.submissionService.handleEvaluationResult(
        parseInt(submissionId),
        parseInt(questionId),
        evaluationResult
      );

      res.json(submission);
    } catch (error: any) {
      console.error('Error handling evaluation result:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

// Create a single instance and export it
const submissionController = new SubmissionController();
export default submissionController; 