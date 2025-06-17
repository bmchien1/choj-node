"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SubmissionService_1 = __importDefault(require("../services/SubmissionService"));
class SubmissionController {
    constructor() {
        this.handleEvaluationResult = async (req, res) => {
            try {
                const { submissionId, questionId } = req.params;
                const { results, score, error } = req.body;
                // Extract only the needed fields
                const evaluationResult = {
                    results: results,
                    score,
                    ...(error && { error })
                };
                const submission = await this.submissionService.handleEvaluationResult(parseInt(submissionId), parseInt(questionId), evaluationResult);
                res.json(submission);
            }
            catch (error) {
                console.error('Error handling evaluation result:', error);
                res.status(400).json({ error: error.message });
            }
        };
        this.submissionService = SubmissionService_1.default.getInstance();
    }
}
// Create a single instance and export it
const submissionController = new SubmissionController();
exports.default = submissionController;
