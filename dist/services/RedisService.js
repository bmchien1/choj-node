"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const data_source_1 = require("../data-source");
const Submission_1 = require("../entities/Submission");
const types_1 = require("../types");
const utils_1 = require("../utils");
const decimal_js_1 = __importDefault(require("decimal.js"));
const CompilerService_1 = __importDefault(require("./CompilerService"));
class RedisService {
    constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        };
        this.publisher = new ioredis_1.default(redisConfig);
        this.subscriber = new ioredis_1.default(redisConfig);
        this.compilerService = CompilerService_1.default.getInstance();
        this.initialize();
    }
    async initialize() {
        this.subscriber.subscribe("submission");
        this.subscriber.on("message", async (channel, message) => {
            if (channel === "submission") {
                const tokens = JSON.parse(message);
                await this.processSubmissions(tokens);
            }
        });
    }
    async processSubmissions(tokens) {
        for (let i = 0; i < 10; i++) {
            const { submissions } = await this.compilerService.getSubmissionsBatch(tokens);
            if (submissions.every((sub) => sub.status.id > 2)) {
                await this.updateSubmissionResults(tokens, submissions);
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    async updateSubmissionResults(tokens, results) {
        const submissionRepository = data_source_1.AppDataSource.getRepository(Submission_1.Submission);
        const submission = await submissionRepository.findOne({ where: { listSubmissionToken: tokens.join(",") } });
        if (!submission)
            return;
        let totalPassed = 0;
        results.forEach((res, idx) => {
            if ((0, utils_1.getSubmissionStatus)(res.status.id) === types_1.SubmissionStatus.ACCEPTED)
                totalPassed++;
        });
        submission.status = totalPassed === results.length ? types_1.SubmissionStatus.ACCEPTED : types_1.SubmissionStatus.REJECTED;
        submission.score = new decimal_js_1.default((totalPassed / results.length) * submission.question.maxPoint).toNumber();
        await submissionRepository.save(submission);
    }
    async addSubmissionEvent(tokens) {
        await this.publisher.publish("submission", JSON.stringify(tokens));
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
}
exports.default = RedisService;
