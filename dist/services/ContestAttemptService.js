"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContestAttemptService = void 0;
const data_source_1 = require("../data-source");
const ContestAttempt_1 = require("../entities/ContestAttempt");
const Contest_1 = require("../entities/Contest");
const User_1 = require("../entities/User");
class ContestAttemptService {
    constructor() {
        this.attemptRepository = data_source_1.AppDataSource.getRepository(ContestAttempt_1.ContestAttempt);
        this.contestRepository = data_source_1.AppDataSource.getRepository(Contest_1.Contest);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    static getInstance() {
        if (!ContestAttemptService.instance) {
            ContestAttemptService.instance = new ContestAttemptService();
        }
        return ContestAttemptService.instance;
    }
    async startAttempt(userId, contest) {
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
        attempt.endTime = new Date();
        attempt.isSubmitted = true;
        return await this.attemptRepository.save(attempt);
    }
    async getActiveAttempt(userId, contestId) {
        return await this.attemptRepository.findOne({
            where: {
                user: { id: userId },
                contest: { id: contestId },
                isSubmitted: false,
            },
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
    async saveTemporaryAnswers(attemptId, answers) {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error("Attempt not found");
        }
        attempt.answers = answers;
        return await this.attemptRepository.save(attempt);
    }
    async getTemporaryAnswers(attemptId) {
        const attempt = await this.attemptRepository.findOne({
            where: { id: attemptId },
        });
        if (!attempt) {
            throw new Error("Attempt not found");
        }
        return attempt.answers;
    }
    async getAttemptsByUserAndContest(userId, contestId) {
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
    } //
}
exports.ContestAttemptService = ContestAttemptService;
