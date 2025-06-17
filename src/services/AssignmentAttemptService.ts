import { Repository } from "typeorm";
import { AssignmentAttempt } from "../entities/AssignmentAttempt";
import { Assignment } from "../entities/Assignment";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";

class AssignmentAttemptService {
  private readonly attemptRepository: Repository<AssignmentAttempt>;
  private static instance: AssignmentAttemptService;

  constructor() {
    this.attemptRepository = AppDataSource.getRepository(AssignmentAttempt);
  }

  public static getInstance(): AssignmentAttemptService {
    if (!AssignmentAttemptService.instance) {
      AssignmentAttemptService.instance = new AssignmentAttemptService();
    }
    return AssignmentAttemptService.instance;
  }

  async startAttempt(userId: number, assignment: Assignment): Promise<AssignmentAttempt> {
    // Check if there's an existing active attempt
    const existingAttempt = await this.attemptRepository.findOne({
      where: {
        user: { id: userId },
        assignment: { id: assignment.id },
        isSubmitted: false,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create new attempt
    const attempt = this.attemptRepository.create({
      user: { id: userId },
      assignment,
      startTime: new Date(),
      lastActiveTime: new Date(),
      timeLeft: assignment.duration * 60, // Convert minutes to seconds
      isSubmitted: false,
    });

    return await this.attemptRepository.save(attempt);
  }

  async updateLastActiveTime(attemptId: number): Promise<AssignmentAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.lastActiveTime = new Date();
    return await this.attemptRepository.save(attempt);
  }

  async submitAttempt(attemptId: number): Promise<AssignmentAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.isSubmitted = true;
    return await this.attemptRepository.save(attempt);
  }

  async getActiveAttempt(userId: number, assignmentId: number): Promise<AssignmentAttempt | null> {
    return await this.attemptRepository.findOne({
      where: {
        user: { id: userId },
        assignment: { id: assignmentId },
        isSubmitted: false,
      },
      relations: ["user", "assignment"],
    });
  }

  async updateTimeLeft(attemptId: number, timeLeft: number): Promise<AssignmentAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    attempt.timeLeft = timeLeft;
    return await this.attemptRepository.save(attempt);
  }
}
//
export { AssignmentAttemptService }; 