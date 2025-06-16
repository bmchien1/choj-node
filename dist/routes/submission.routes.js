"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SubmissionController_1 = __importDefault(require("../controllers/SubmissionController"));
const router = (0, express_1.Router)();
router.post("/:submissionId/questions/:questionId/evaluation-result", SubmissionController_1.default.handleEvaluationResult);
exports.default = router;
