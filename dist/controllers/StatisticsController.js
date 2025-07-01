"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../services/UserService");
const ContestService_1 = __importDefault(require("../services/ContestService"));
const QuestionService_1 = require("../services/QuestionService");
const SubmissionService_1 = __importDefault(require("../services/SubmissionService"));
const StatisticsController = {
    async getStatistics(req, res) {
        const [totalUsers, totalContests, totalProblems, totalSubmissions] = await Promise.all([
            UserService_1.UserService.getInstance().countUsers(),
            ContestService_1.default.getInstance().countContests(),
            QuestionService_1.QuestionService.getInstance().countQuestions(),
            SubmissionService_1.default.getInstance().countSubmissions(),
        ]);
        res.json({ totalUsers, totalContests, totalProblems, totalSubmissions });
    },
    async getTopUsers(req, res) {
        const users = await UserService_1.UserService.getInstance().getTopUsers(10);
        res.json(users);
    },
    async getRecentContests(req, res) {
        const contests = await ContestService_1.default.getInstance().getRecentContests(5);
        res.json(contests);
    },
    async getRecentProblems(req, res) {
        const problems = await QuestionService_1.QuestionService.getInstance().getRecentProblems(5);
        res.json(problems);
    },
};
exports.default = StatisticsController;
