import { Router } from "express";
import StatisticsController from "../controllers/StatisticsController";

const router = Router();

router.get("/", StatisticsController.getStatistics);
router.get("/top-users", StatisticsController.getTopUsers);
router.get("/recent-contests", StatisticsController.getRecentContests);
router.get("/recent-problems", StatisticsController.getRecentProblems);

export default router; 