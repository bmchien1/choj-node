import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import ContestService from "../services/ContestService";
import { QuestionService } from "../services/QuestionService";
import SubmissionService from "../services/SubmissionService";

const StatisticsController = {
  async getStatistics(req: Request, res: Response) {
    const [totalUsers, totalContests, totalProblems, totalSubmissions] = await Promise.all([
      UserService.getInstance().countUsers(),
      ContestService.getInstance().countContests(),
      QuestionService.getInstance().countQuestions(),
      SubmissionService.getInstance().countSubmissions(),
    ]);
    res.json({ totalUsers, totalContests, totalProblems, totalSubmissions });
  },

  async getTopUsers(req: Request, res: Response) {
    const users = await UserService.getInstance().getTopUsers(10);
    res.json(users);
  },

  async getRecentContests(req: Request, res: Response) {
    const contests = await ContestService.getInstance().getRecentContests(5);
    res.json(contests);
  },

  async getRecentProblems(req: Request, res: Response) {
    const problems = await QuestionService.getInstance().getRecentProblems(5);
    res.json(problems);
  },
};

export default StatisticsController;