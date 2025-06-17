"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Contest_1 = require("../entities/Contest");
const User_1 = require("../entities/User");
const Question_1 = require("../entities/Question");
const uuid_1 = require("uuid");
const Matrix_1 = require("../entities/Matrix");
const ContestAttempt_1 = require("../entities/ContestAttempt");
class ContestService {
    constructor() {
        this.contestRepository = data_source_1.AppDataSource.getRepository(Contest_1.Contest);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
        this.matrixRepository = data_source_1.AppDataSource.getRepository(Matrix_1.Matrix);
        this.attemptRepository = data_source_1.AppDataSource.getRepository(ContestAttempt_1.ContestAttempt);
    }
    static getInstance() {
        if (!ContestService.instance) {
            ContestService.instance = new ContestService();
        }
        return ContestService.instance;
    }
    async createContest(title, description, isPublic, startTime, endTime, duration, creatorId, questions_scores) {
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new Error("Creator not found");
        }
        const contest = new Contest_1.Contest();
        contest.title = title;
        contest.description = description;
        contest.isPublic = isPublic;
        contest.startTime = startTime;
        contest.endTime = endTime;
        contest.duration = duration;
        contest.creator = creator;
        if (questions_scores)
            contest.questions_scores = questions_scores;
        if (!isPublic) {
            contest.accessUrl = (0, uuid_1.v4)();
        }
        return this.contestRepository.save(contest);
    }
    async getContestById(id) {
        return this.contestRepository.findOne({
            where: { id },
            relations: ["creator", "questions"]
        });
    }
    async getContestByUrl(accessUrl) {
        return this.contestRepository.findOne({
            where: { accessUrl },
            relations: ["creator", "questions"]
        });
    }
    async getPublicContests() {
        return this.contestRepository.find({
            where: { isPublic: true },
            relations: ["creator"],
            order: { createdAt: "DESC" }
        });
    }
    async getContestsByCreator(creatorId) {
        return this.contestRepository.find({
            where: { creator: { id: creatorId } },
            relations: ["creator"],
            order: { createdAt: "DESC" }
        });
    }
    async updateContest(id, title, description, isPublic, startTime, endTime, duration, userId, questions_scores) {
        const contest = await this.contestRepository.findOne({
            where: { id },
            relations: ["creator"]
        });
        if (!contest) {
            throw new Error("Contest not found");
        }
        if (contest.creator.id !== userId) {
            throw new Error("Unauthorized to update this contest");
        }
        contest.title = title;
        contest.description = description;
        contest.isPublic = isPublic;
        contest.startTime = startTime;
        contest.endTime = endTime;
        contest.duration = duration;
        if (questions_scores)
            contest.questions_scores = questions_scores;
        if (!isPublic && !contest.accessUrl) {
            contest.accessUrl = (0, uuid_1.v4)();
        }
        return this.contestRepository.save(contest);
    }
    async deleteContest(id, userId) {
        const contest = await this.contestRepository.findOne({
            where: { id },
            relations: ["creator"]
        });
        if (!contest) {
            throw new Error("Contest not found");
        }
        if (contest.creator.id !== userId) {
            throw new Error("Unauthorized to delete this contest");
        }
        await this.contestRepository.remove(contest);
    }
    async addQuestionToContest(contestId, questionId, userId) {
        const contest = await this.contestRepository.findOne({
            where: { id: contestId },
            relations: ["creator", "questions"]
        });
        if (!contest) {
            throw new Error("Contest not found");
        }
        if (contest.creator.id !== userId) {
            throw new Error("Unauthorized to modify this contest");
        }
        const question = await this.questionRepository.findOne({
            where: { id: questionId }
        });
        if (!question) {
            throw new Error("Question not found");
        }
        if (!contest.questions) {
            contest.questions = [];
        }
        contest.questions.push(question);
        return this.contestRepository.save(contest);
    }
    async removeQuestionFromContest(contestId, questionId, userId) {
        const contest = await this.contestRepository.findOne({
            where: { id: contestId },
            relations: ["creator", "questions"]
        });
        if (!contest) {
            throw new Error("Contest not found");
        }
        if (contest.creator.id !== userId) {
            throw new Error("Unauthorized to modify this contest");
        }
        if (!contest.questions) {
            contest.questions = [];
        }
        contest.questions = contest.questions.filter(q => q.id !== questionId);
        return this.contestRepository.save(contest);
    }
    async addQuestionsByMatrix(contestId, matrixId, userId) {
        const contest = await this.contestRepository.findOne({
            where: { id: contestId },
            relations: ["creator", "questions"]
        });
        if (!contest)
            throw new Error("Contest not found");
        if (contest.creator.id !== userId)
            throw new Error("Unauthorized to modify this contest");
        const matrix = await this.matrixRepository.findOne({ where: { id: matrixId } });
        if (!matrix)
            throw new Error("Matrix not found");
        if (!matrix.criteria || matrix.criteria.length === 0)
            throw new Error("No criteria in matrix");
        const existingIds = new Set((contest.questions || []).map(q => q.id));
        for (const criterion of matrix.criteria) {
            // Query questions that match questionType, difficulty_level, creator, and all specified tags
            const questions = await this.questionRepository
                .createQueryBuilder("question")
                .innerJoin("question.tags", "tag")
                .where("question.questionType = :questionType", { questionType: criterion.questionType })
                .andWhere("question.difficulty_level = :difficulty_level", { difficulty_level: criterion.difficulty_level })
                .andWhere("question.creatorId = :creatorId", { creatorId: userId })
                .andWhere("tag.id IN (:...tagIds)", { tagIds: criterion.tagIds })
                .groupBy("question.id")
                .having("COUNT(DISTINCT tag.id) >= :tagCount", { tagCount: criterion.tagIds.length })
                .getMany();
            for (const q of questions) {
                if (!existingIds.has(q.id)) {
                    if (!contest.questions)
                        contest.questions = [];
                    contest.questions.push(q);
                    existingIds.add(q.id);
                }
            }
        }
        return this.contestRepository.save(contest);
    }
    async submitAttempt(id) {
        const attempt = await this.attemptRepository.findOne({
            where: { id },
            relations: ["contest", "user"]
        });
        if (!attempt) {
            throw new Error("Attempt not found");
        }
        console.log('Processing submission for attempt:', {
            attemptId: attempt.id,
            contestId: attempt.contest.id,
            userId: attempt.user.id,
            startTime: attempt.startTime,
            endTime: new Date(),
            timeLeft: attempt.timeLeft
        });
        attempt.endTime = new Date();
        attempt.isSubmitted = true;
        const savedAttempt = await this.attemptRepository.save(attempt);
        console.log('Attempt submitted successfully:', {
            attemptId: savedAttempt.id,
            submissionTime: savedAttempt.endTime
        });
        return savedAttempt;
    } //
}
exports.default = ContestService;
