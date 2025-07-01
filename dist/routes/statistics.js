"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StatisticsController_1 = __importDefault(require("../controllers/StatisticsController"));
const router = (0, express_1.Router)();
router.get("/", StatisticsController_1.default.getStatistics);
router.get("/top-users", StatisticsController_1.default.getTopUsers);
router.get("/recent-contests", StatisticsController_1.default.getRecentContests);
router.get("/recent-problems", StatisticsController_1.default.getRecentProblems);
exports.default = router;
