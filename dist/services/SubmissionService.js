"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Submission_1 = require("../entities/Submission");
const data_source_1 = require("../data-source");
const Question_1 = require("../entities/Question");
const CompilerService_1 = __importDefault(require("./CompilerService"));
const User_1 = require("../entities/User");
const Assignment_1 = require("../entities/Assignment");
const Contest_1 = require("../entities/Contest");
const Course_1 = require("../entities/Course");
class SubmissionService {
    constructor() {
        this.languageMap = {
            javascript: "javascript",
            python: "python",
            java: "java",
            c: "c",
            cpp: "cpp",
            c_cpp: "cpp",
        };
        this.submissionRepository = data_source_1.AppDataSource.getRepository(Submission_1.Submission);
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(Assignment_1.Assignment);
        this.contestRepository = data_source_1.AppDataSource.getRepository(Contest_1.Contest);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.compilerService = CompilerService_1.default.getInstance();
    }
    static getInstance() {
        if (!SubmissionService.instance) {
            SubmissionService.instance = new SubmissionService();
        }
        return SubmissionService.instance;
    }
    async submitAssignment(userId, assignmentId, testId, answers) {
        if (!userId || (!assignmentId && !testId)) {
            throw new Error("User ID and either assignment ID or test ID are required");
        }
        if (assignmentId && testId) {
            throw new Error("Submission cannot be linked to both an assignment and a test");
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        let assignment = null;
        let contest = null;
        let course = null;
        if (assignmentId) {
            assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
                relations: ["questions", "course"],
            });
            if (!assignment)
                throw new Error(`Assignment ${assignmentId} not found`);
            course = assignment.course;
        }
        else if (testId) {
            contest = await this.contestRepository.findOne({
                where: { id: testId },
                relations: ["questions"],
            });
            if (!contest)
                throw new Error(`Contest ${testId} not found`);
        }
        // Create submission even if there are no answers
        const submission = this.submissionRepository.create({
            user,
            assignment: assignment ?? undefined,
            contest: contest ?? undefined,
            course: course ?? undefined,
            answers: answers.length > 0 ? JSON.stringify(answers) : JSON.stringify([]),
            score: 0,
            submitted_at: new Date(),
        });
        const savedSubmission = await this.submissionRepository.save(submission);
        // If no answers provided, return submission with 0 score
        if (!answers.length) {
            return savedSubmission;
        }
        let totalScore = 0;
        const evaluationResults = [];
        // Load question_scores from assignment or use test's questions_scores
        const questionScores = assignment
            ? assignment.questions_scores || {}
            : contest?.questions_scores || {};
        for (const answer of answers) {
            if (!answer.sourceCode?.trim()) {
                evaluationResults.push({
                    questionId: answer.questionId,
                    passed: false,
                    score: 0,
                    error: "No answer provided",
                });
                continue;
            }
            const question = await this.questionRepository.findOne({ where: { id: answer.questionId } });
            if (!question) {
                evaluationResults.push({
                    questionId: answer.questionId,
                    passed: false,
                    score: 0,
                    error: "Question not found",
                });
                continue;
            }
            if (question.questionType === "true-false")
                continue;
            const mappedLanguage = this.languageMap[answer.language?.toLowerCase() || question.language?.toLowerCase() || "javascript"] || "javascript";
            const maxPoints = questionScores[question.id] || question.maxPoint || 10;
            if (question.questionType === "coding") {
                const testCases = question.testCases || [];
                if (!testCases.length) {
                    evaluationResults.push({
                        questionId: answer.questionId,
                        passed: false,
                        score: 0,
                        error: "No test cases defined",
                    });
                    continue;
                }
                try {
                    const results = await this.compilerService.runCode(mappedLanguage, answer.sourceCode, testCases);
                    const passedTests = results.filter((r) => r.passed).length;
                    const totalTests = testCases.length;
                    const questionScore = Math.round((passedTests / totalTests) * maxPoints);
                    const allPassed = passedTests === totalTests;
                    totalScore += questionScore;
                    evaluationResults.push({
                        questionId: answer.questionId,
                        results: results.map((r, idx) => ({
                            testCase: idx + 1,
                            passed: r.passed,
                            output: r.output,
                            expected: testCases[idx].output,
                            error: r.error,
                        })),
                        passed: allPassed,
                        score: questionScore,
                        maxPoints,
                    });
                }
                catch (err) {
                    evaluationResults.push({
                        questionId: answer.questionId,
                        passed: false,
                        score: 0,
                        error: err.message || "Failed to evaluate code",
                    });
                }
            }
            else {
                const isCorrect = this.checkAnswer(question, answer.sourceCode);
                const questionScore = isCorrect ? maxPoints : 0;
                totalScore += questionScore;
                evaluationResults.push({
                    questionId: answer.questionId,
                    passed: isCorrect,
                    score: questionScore,
                    maxPoints,
                    output: answer.sourceCode,
                });
            }
        }
        savedSubmission.score = totalScore;
        savedSubmission.results = JSON.stringify(evaluationResults);
        return await this.submissionRepository.save(savedSubmission);
    }
    checkAnswer(question, answer) {
        switch (question.questionType) {
            case "multiple-choice":
            case "short-answer":
                return question.correctAnswer?.toLowerCase() === answer.toLowerCase();
            default:
                return false;
        }
    }
    async buildCode(language, sourceCode, input) {
        console.log(`Building code, language: ${language}, sourceCode:\n${sourceCode}, input:\n${input}`);
        if (!sourceCode.trim()) {
            throw new Error("Source code cannot be empty");
        }
        if (/^\d+$/.test(sourceCode.trim())) {
            throw new Error("Source code cannot be a numeric value");
        }
        try {
            const mappedLanguage = this.languageMap[language.toLowerCase()] || "javascript";
            const result = await this.compilerService.runCode(mappedLanguage, sourceCode, [{ input, output: "" }]);
            return {
                output: result[0]?.output || "",
                error: result[0]?.error || "",
            };
        }
        catch (err) {
            return { error: err.message || "Failed to run code" };
        }
    }
    async getSubmissionsByAssignment(assignmentId) {
        if (!assignmentId)
            throw new Error("Assignment ID is required");
        return this.submissionRepository.find({
            where: { assignment: { id: assignmentId } },
            relations: ["user", "assignment"],
        });
    }
    async getSubmissionsByContest(contestId) {
        if (!contestId)
            throw new Error("Contest ID is required");
        return this.submissionRepository.find({
            where: { contest: { id: contestId } },
            relations: ["user", "contest"],
        });
    }
    async getSubmissionsByCourse(courseId) {
        if (!courseId)
            throw new Error("Course ID is required");
        return this.submissionRepository.find({
            where: { course: { id: courseId } },
            relations: ["user", "course", "assignment"],
        });
    }
    async getSubmissionsByUser(userId) {
        if (!userId)
            throw new Error("User ID is required");
        return this.submissionRepository.find({
            where: { user: { id: userId } },
            relations: ["user", "assignment", "test"],
        });
    }
    async getSubmissionById(submissionId) {
        if (!submissionId)
            throw new Error("Submission ID is required");
        const submission = await this.submissionRepository.findOne({
            where: { id: submissionId },
            relations: ["user", "assignment", "test"],
        });
        if (!submission)
            throw new Error(`Submission with ID ${submissionId} not found`);
        return submission;
    }
    async getAllSubmissions() {
        return this.submissionRepository.find({
            relations: ["user", "course", "assignment", "contest"],
        });
    }
}
exports.default = SubmissionService;
