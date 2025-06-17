import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { ContestAttempt } from "../entities/ContestAttempt";
import { Contest } from "../entities/Contest";
import { User } from "../entities/User";

export class ContestAttemptService {
  private readonly attemptRepository: Repository<ContestAttempt>;
  private readonly contestRepository: Repository<Contest>;
  private readonly userRepository: Repository<User>;
  private static instance: ContestAttemptService;

  private constructor() {
    this.attemptRepository = AppDataSource.getRepository(ContestAttempt);
    this.contestRepository = AppDataSource.getRepository(Contest);
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance(): ContestAttemptService {
    if (!ContestAttemptService.instance) {
      ContestAttemptService.instance = new ContestAttemptService();
    }
    return ContestAttemptService.instance;
  }

  async startAttempt(userId: number, contest: Contest): Promise<ContestAttempt> {
    // Check if user already has an attempt for this contest
    const existingAttempt = await this.attemptRepository.findOne({
      where: {
        user: { id: userId },
        contest: { id: contest.id },
      },
    });

    if (existingAttempt) {
      throw new Error("You have already attempted this contest");
    }

    const attempt = this.attemptRepository.create({
      user: { id: userId },
      contest: { id: contest.id },
      startTime: new Date(),
      timeLeft: contest.duration * 60, // Convert minutes to seconds
      isSubmitted: false,
    });

    return await this.attemptRepository.save(attempt);
  }

  async updateLastActiveTime(attemptId: number): Promise<ContestAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.lastActiveTime = new Date();
    return await this.attemptRepository.save(attempt);
  }

  async submitAttempt(attemptId: number): Promise<ContestAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.endTime = new Date();
    attempt.isSubmitted = true;
    return await this.attemptRepository.save(attempt);
  }

  async getActiveAttempt(userId: number, contestId: number): Promise<ContestAttempt | null> {
    return await this.attemptRepository.findOne({
      where: {
        user: { id: userId },
        contest: { id: contestId },
        isSubmitted: false,
      },
    });
  }

  async updateTimeLeft(attemptId: number, timeLeft: number): Promise<ContestAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.timeLeft = timeLeft;
    return await this.attemptRepository.save(attempt);
  }

  async saveTemporaryAnswers(attemptId: number, answers: any): Promise<ContestAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.answers = answers;
    return await this.attemptRepository.save(attempt);
  }

  async getTemporaryAnswers(attemptId: number): Promise<any> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    return attempt.answers;
  }

  async getAttemptsByUserAndContest(userId: number, contestId: number): Promise<ContestAttempt[]> {
    return this.attemptRepository.find({
      where: {
        user: { id: userId },
        contest: { id: contestId }
      },
      relations: ["user", "contest"],
      order: {
        startTime: "DESC"
      }
    });
  }//
} 