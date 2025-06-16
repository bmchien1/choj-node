"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentAttemptService = void 0;
const AssignmentAttempt_1 = require("../entities/AssignmentAttempt");
const data_source_1 = require("../data-source");
class AssignmentAttemptService {
    constructor() {
        this.attemptRepository = data_source_1.AppDataSource.getRepository(AssignmentAttempt_1.AssignmentAttempt);
    }
    static getInstance() {
        if (!AssignmentAttemptService.instance) {
            AssignmentAttemptService.instance = new AssignmentAttemptService();
        }
        return AssignmentAttemptService.instance;
    }
    async startAttempt(userId, assignment) {
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
    async updateLastActiveTime(attemptId) {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error("Attempt not found");
        }
        attempt.lastActiveTime = new Date();
        return await this.attemptRepository.save(attempt);
    }
    async submitAttempt(attemptId) {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error("Attempt not found");
        }
        attempt.isSubmitted = true;
        return await this.attemptRepository.save(attempt);
    }
    async getActiveAttempt(userId, assignmentId) {
        return await this.attemptRepository.findOne({
            where: {
                user: { id: userId },
                assignment: { id: assignmentId },
                isSubmitted: false,
            },
            relations: ["user", "assignment"],
        });
    }
    async updateTimeLeft(attemptId, timeLeft) {
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
exports.AssignmentAttemptService = AssignmentAttemptService;
