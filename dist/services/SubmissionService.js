"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Submission_1 = require("../entities/Submission");
const data_source_1 = require("../data-source");
const Question_1 = require("../entities/Question");
const User_1 = require("../entities/User");
const Assignment_1 = require("../entities/Assignment");
const Contest_1 = require("../entities/Contest");
const axios_1 = __importDefault(require("axios"));
class SubmissionService {
    constructor() {
        this.languageMap = {
            python: "python",
            java: "java",
            cpp: "cpp",
        };
        this.submissionRepository = data_source_1.AppDataSource.getRepository(Submission_1.Submission);
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(Assignment_1.Assignment);
        this.contestRepository = data_source_1.AppDataSource.getRepository(Contest_1.Contest);
        this.evaluationServiceUrl = process.env.EVALUATION_SERVICE_URL || "http://localhost:5001";
    }
    static getInstance() {
        if (!SubmissionService.instance) {
            SubmissionService.instance = new SubmissionService();
        }
        return SubmissionService.instance;
    }
    async submitAssignment(userId, assignmentId, testId, answers) {
        console.log('=== Starting Submission Process ===');
        console.log('Input parameters:', { userId, assignmentId, testId, answers });
        if (!userId || (!assignmentId && !testId)) {
            console.error('Validation failed: Missing required parameters');
            throw new Error("User ID and either assignment ID or test ID are required");
        }
        if (assignmentId && testId) {
            console.error('Validation failed: Cannot have both assignmentId and testId');
            throw new Error("Submission cannot be linked to both an assignment and a test");
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.error('User not found:', userId);
            throw new Error("User not found");
        }
        console.log('Found user:', { id: user.id, email: user.email });
        let assignment = null;
        let contest = null;
        let course = null;
        if (assignmentId) {
            assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
                relations: ["questions", "course"],
            });
            if (!assignment) {
                console.error('Assignment not found:', assignmentId);
                throw new Error(`Assignment ${assignmentId} not found`);
            }
            course = assignment.course;
            console.log('Found assignment:', {
                id: assignment.id,
                title: assignment.title,
                courseId: course?.id
            });
        }
        else if (testId) {
            contest = await this.contestRepository.findOne({
                where: { id: testId },
                relations: ["questions"],
            });
            if (!contest) {
                console.error('Contest not found:', testId);
                throw new Error(`Contest ${testId} not found`);
            }
            console.log('Found contest:', { id: contest.id, title: contest.title });
        }
        // Create submission with pending status
        console.log('Creating submission record...');
        const submission = this.submissionRepository.create({
            user,
            assignment: assignment ?? undefined,
            contest: contest ?? undefined,
            course: course ?? undefined,
            answers: answers.length > 0 ? JSON.stringify(answers) : JSON.stringify([]),
            score: 0,
            submitted_at: new Date(),
            status: "pending"
        });
        const savedSubmission = await this.submissionRepository.save(submission);
        console.log('Saved submission:', {
            id: savedSubmission.id,
            status: savedSubmission.status,
            submitted_at: savedSubmission.submitted_at
        });
        // If no answers provided, return submission with 0 score
        if (!answers.length) {
            console.log('No answers provided, returning submission with 0 score');
            return savedSubmission;
        }
        try {
            // Process non-coding questions first
            const evaluationResults = [];
            let totalScore = 0;
            const codingAnswers = [];
            // Load question_scores from assignment or use test's questions_scores
            const questionScores = assignment
                ? assignment.questions_scores || {}
                : contest?.questions_scores || {};
            for (const answer of answers) {
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
                const maxPoints = questionScores[question.id] || question.maxPoint || 10;
                if (question.questionType === "multiple-choice" || question.questionType === "short-answer") {
                    // Process non-coding questions immediately
                    const isCorrect = this.checkAnswer(question, answer.sourceCode);
                    const questionScore = isCorrect ? maxPoints : 0;
                    totalScore += questionScore;
                    evaluationResults.push({
                        questionId: answer.questionId,
                        passed: isCorrect,
                        score: questionScore,
                        maxPoints,
                        output: answer.sourceCode,
                        type: question.questionType
                    });
                }
                else if (question.questionType === "coding") {
                    // Collect coding questions for evaluation service
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
                    const callbackUrl = `${process.env.API_URL || "http://host.docker.internal:8080"}/api/submissions/${savedSubmission.id}/questions/${answer.questionId}/evaluation-result`;
                    codingAnswers.push({
                        sourceCode: answer.sourceCode,
                        language: answer.language || "python",
                        testCases,
                        timeLimit: question.cpuTimeLimit || 1000,
                        cpuLimit: 100,
                        memoryLimit: question.memoryLimit || 128,
                        callbackUrl
                    });
                }
            }
            // Update submission with non-coding results
            savedSubmission.results = JSON.stringify(evaluationResults);
            savedSubmission.score = totalScore;
            if (codingAnswers.length > 0) {
                // Send coding answers to evaluation service
                console.log('Sending coding answers to evaluation service...');
                await this.sendToEvaluationService(codingAnswers);
                // Update status to evaluating
                savedSubmission.status = "evaluating";
            }
            else {
                // All questions are done, mark as completed
                savedSubmission.status = "completed";
            }
            return await this.submissionRepository.save(savedSubmission);
        }
        catch (error) {
            console.error('Error in evaluation process:', error);
            savedSubmission.status = "failed";
            savedSubmission.results = JSON.stringify([{ error: "Failed to process submission" }]);
            return await this.submissionRepository.save(savedSubmission);
        }
    }
    async sendToEvaluationService(codingAnswers) {
        console.log('=== Sending to Evaluation Service ===');
        console.log('Coding Answers:', codingAnswers);
        try {
            await axios_1.default.post(`${this.evaluationServiceUrl}/evaluate`, {
                answers: codingAnswers
            });
            console.log('Successfully sent to evaluation service');
        }
        catch (error) {
            console.error('Error sending to evaluation service:', error);
            throw error;
        }
    }
    async handleEvaluationResult(submissionId, questionId, result) {
        console.log('=== Handling Evaluation Result ===');
        console.log('Submission ID:', submissionId);
        console.log('Question ID:', questionId);
        console.log('Result:', result);
        const submission = await this.submissionRepository.findOne({ where: { id: submissionId } });
        if (!submission) {
            console.error('Submission not found:', submissionId);
            throw new Error(`Submission ${submissionId} not found`);
        }
        // Get existing results
        const existingResults = JSON.parse(submission.results || '[]');
        // Calculate question score based on passed test cases
        const totalTests = result.results.length;
        const questionScore = Math.round((result.score / totalTests) * 10); // Assuming max point is 10
        // Add coding results
        const updatedResults = [
            ...existingResults,
            {
                questionId: questionId,
                results: result.results,
                passed: result.score === totalTests,
                score: questionScore,
                maxPoints: 10,
                error: result.error
            }
        ];
        // Update submission with new results
        submission.score = submission.score + questionScore;
        submission.results = JSON.stringify(updatedResults);
        // Check if all coding questions have been evaluated
        const answers = JSON.parse(submission.answers || '[]');
        const codingQuestions = answers.filter((a) => {
            const result = updatedResults.find(r => r.questionId === a.questionId);
            return result !== undefined;
        });
        if (codingQuestions.length === answers.length) {
            submission.status = "completed";
        }
        const updatedSubmission = await this.submissionRepository.save(submission);
        console.log('Updated submission with evaluation result:', {
            id: updatedSubmission.id,
            status: updatedSubmission.status,
            score: updatedSubmission.score
        });
        return updatedSubmission;
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
            const mappedLanguage = this.languageMap[language.toLowerCase()] || "python";
            // Send to evaluation service with build type
            const response = await axios_1.default.post(`${this.evaluationServiceUrl}/build`, {
                type: "build",
                language: mappedLanguage,
                sourceCode,
                input,
                timeLimit: 1000, // Default 1 second
                cpuLimit: 100, // Default 100%
                memoryLimit: 128 // Default 128MB
            }, {
                timeout: 25000 // 25 seconds timeout for evaluation service
            });
            // Wait for evaluation service to process
            let attempts = 0;
            const maxAttempts = 10;
            const waitTime = 1000; // 1 second
            while (attempts < maxAttempts) {
                if (response.data && (response.data.output !== undefined || response.data.error !== undefined)) {
                    return {
                        output: response.data.output || "",
                        error: response.data.error || "",
                    };
                }
                await new Promise(resolve => setTimeout(resolve, waitTime));
                attempts++;
            }
            return {
                error: "Build timed out. Please try again."
            };
        }
        catch (err) {
            console.error('Build code error:', err);
            if (err.code === 'ECONNABORTED') {
                return { error: "Build request timed out. Please try again." };
            }
            return {
                error: err.response?.data?.message || err.message || "Failed to run code"
            };
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
    async getSubmissionsByAssignmentAndUser(assignmentId, userId) {
        if (!assignmentId || !userId) {
            throw new Error("Assignment ID and User ID are required");
        }
        return this.submissionRepository.find({
            where: {
                assignment: { id: assignmentId },
                user: { id: userId }
            },
            relations: ["user", "assignment"],
            order: { submitted_at: "DESC" }
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
    async getAllByCourseAndUser(courseId, userId) {
        return await this.submissionRepository.find({
            where: {
                assignment: { course: { id: courseId } },
                user: { id: userId }
            },
            relations: ["assignment", "user"]
        });
    }
    async countSubmissions() {
        return this.submissionRepository.count();
    }
}
exports.default = SubmissionService;
