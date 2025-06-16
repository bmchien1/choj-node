import { Request, Response } from "express";
import SubmissionService from "../services/SubmissionService";

class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = SubmissionService.getInstance();
  }

  public async handleEvaluationResult(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId, questionId } = req.params;
      const result = req.body;

      const submission = await this.submissionService.handleEvaluationResult(
        parseInt(submissionId),
        parseInt(questionId),
        result
      );

      res.json(submission);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new SubmissionController(); 