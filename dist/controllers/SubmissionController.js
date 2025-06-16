"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SubmissionService_1 = __importDefault(require("../services/SubmissionService"));
class SubmissionController {
    constructor() {
        this.submissionService = SubmissionService_1.default.getInstance();
    }
    async handleEvaluationResult(req, res) {
        try {
            const { submissionId, questionId } = req.params;
            const result = req.body;
            const submission = await this.submissionService.handleEvaluationResult(parseInt(submissionId), parseInt(questionId), result);
            res.json(submission);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.default = new SubmissionController();
