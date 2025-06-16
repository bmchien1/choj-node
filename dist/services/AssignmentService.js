"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Assignment_1 = require("../entities/Assignment");
const Course_1 = require("../entities/Course");
const Matrix_1 = require("../entities/Matrix");
const data_source_1 = require("../data-source");
const Question_1 = require("../entities/Question");
const Tag_1 = require("../entities/Tag");
const ChapterService_1 = require("./ChapterService");
const Chapter_1 = require("../entities/Chapter");
const typeorm_2 = require("typeorm");
class AssignmentService {
    constructor() {
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(Assignment_1.Assignment);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
        this.matrixRepository = data_source_1.AppDataSource.getRepository(Matrix_1.Matrix);
        this.tagRepository = data_source_1.AppDataSource.getRepository(Tag_1.Tag);
        this.chapterService = ChapterService_1.ChapterService.getInstance();
        this.chapterRepository = data_source_1.AppDataSource.getRepository(Chapter_1.Chapter);
    }
    static getInstance() {
        if (!AssignmentService.instance) {
            AssignmentService.instance = new AssignmentService();
        }
        return AssignmentService.instance;
    }
    async createAssignment(courseId, body) {
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        if (!body.title || !body.description) {
            throw new Error("Title and description are required");
        }
        if (!body.questionIds || !body.question_scores) {
            throw new Error("Question IDs and scores are required");
        }
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new Error("Course not found");
        }
        // Validate that all questions exist
        const questions = await this.questionRepository.findByIds(body.questionIds);
        if (questions.length !== body.questionIds.length) {
            throw new Error("One or more questions not found");
        }
        // Calculate total points
        const total_points = Object.values(body.question_scores).reduce((sum, score) => sum + score, 0);
        let order = body.order;
        if (body.chapterId) {
            // If chapterId is provided, get the next order from the chapter
            const chapter = await this.chapterRepository.findOne({
                where: { id: body.chapterId },
                relations: ["lessons", "assignments"],
            });
            if (!chapter) {
                throw new Error("Chapter not found");
            }
            const lessonOrders = (chapter.lessons || []).map((l) => l.order || 0);
            const assignmentOrders = (chapter.assignments || []).map((a) => a.order || 0);
            order = Math.max(...lessonOrders, ...assignmentOrders, 0) + 1;
        }
        else {
            // If no chapterId, get the next order from the course
            const assignments = await this.assignmentRepository.find({
                where: {
                    course: { id: courseId },
                    chapter: (0, typeorm_2.IsNull)()
                },
                order: { order: "DESC" },
            });
            order = assignments.length > 0 ? assignments[0].order + 1 : 1;
        }
        const assignment = this.assignmentRepository.create({
            title: body.title,
            description: body.description,
            duration: body.duration,
            questions: questions,
            questions_scores: body.question_scores,
            total_points,
            order,
            course: { id: courseId },
            chapter: body.chapterId ? { id: body.chapterId } : undefined,
        });
        return await this.assignmentRepository.save(assignment);
    }
    async checkMatrixAssignment(courseId, matrixId, teacherId) {
        if (!courseId || !matrixId || !teacherId) {
            throw new Error("Course ID, Matrix ID, and Teacher ID are required");
        }
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new Error("Course not found");
        }
        const matrix = await this.matrixRepository.findOne({ where: { id: matrixId } });
        if (!matrix) {
            throw new Error("Matrix not found");
        }
        const selectedQuestions = {};
        for (let i = 0; i < matrix.criteria.length; i++) {
            const criterion = matrix.criteria[i];
            // Validate tagIds exist
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(criterion.tagIds) });
            if (tags.length !== criterion.tagIds.length) {
                return {
                    isValid: false,
                    message: `Invalid tag IDs in criterion: ${criterion.questionType}, ${criterion.difficulty_level}`,
                };
            }
            // Query questions that match questionType, difficulty_level, creator, and ALL specified tags
            const questions = await this.questionRepository
                .createQueryBuilder("question")
                .innerJoin("question.tags", "tag")
                .where("question.questionType = :questionType", { questionType: criterion.questionType })
                .andWhere("question.difficulty_level = :difficulty_level", { difficulty_level: criterion.difficulty_level })
                .andWhere("question.creatorId = :creatorId", { creatorId: teacherId })
                .andWhere("tag.id IN (:...tagIds)", { tagIds: criterion.tagIds })
                .groupBy("question.id")
                .having("COUNT(DISTINCT tag.id) = :tagCount", { tagCount: criterion.tagIds.length })
                .getMany();
            if (questions.length === 0) {
                const tagNames = tags.map((tag) => tag.name).join(", ");
                return {
                    isValid: false,
                    message: `No questions found for criterion: ${criterion.questionType}, ${criterion.difficulty_level}, Tags: ${tagNames}`,
                };
            }
            selectedQuestions[i] = questions;
        }
        return {
            isValid: true,
            message: "Matrix can generate a valid assignment",
            selectedQuestions,
        };
    }
    async createAssignmentFromMatrix(courseId, matrixId, teacherId, body) {
        if (!courseId || !matrixId || !teacherId) {
            throw new Error("Course ID, Matrix ID, and Teacher ID are required");
        }
        if (!body.title || !body.description) {
            throw new Error("Title and description are required");
        }
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new Error("Course not found");
        }
        const matrix = await this.matrixRepository.findOne({ where: { id: matrixId } });
        if (!matrix) {
            throw new Error("Matrix not found");
        }
        const questionIds = [];
        const question_scores = {};
        const total_points = matrix.total_points || 100; // Default to 100 if not specified
        for (const criterion of matrix.criteria) {
            // Validate tagIds exist
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(criterion.tagIds) });
            if (tags.length !== criterion.tagIds.length) {
                throw new Error(`Invalid tag IDs in criterion: ${criterion.questionType}, ${criterion.difficulty_level}`);
            }
            // Query questions that match questionType, difficulty_level, creator, and ALL specified tags
            const questions = await this.questionRepository
                .createQueryBuilder("question")
                .innerJoin("question.tags", "tag")
                .where("question.questionType = :questionType", { questionType: criterion.questionType })
                .andWhere("question.difficulty_level = :difficulty_level", { difficulty_level: criterion.difficulty_level })
                .andWhere("question.creatorId = :creatorId", { creatorId: teacherId })
                .andWhere("tag.id IN (:...tagIds)", { tagIds: criterion.tagIds })
                .groupBy("question.id")
                .having("COUNT(DISTINCT tag.id) = :tagCount", { tagCount: criterion.tagIds.length })
                .getMany();
            if (questions.length === 0) {
                const tagNames = tags.map((tag) => tag.name).join(", ");
                throw new Error(`No questions found for criterion: ${criterion.questionType}, ${criterion.difficulty_level}, Tags: ${tagNames}`);
            }
            // Select one question randomly
            const question = questions[Math.floor(Math.random() * questions.length)];
            questionIds.push(question.id);
            question_scores[question.id] = (criterion.percentage / 100) * total_points;
        }
        const questions = await this.questionRepository.find({
            where: { id: (0, typeorm_1.In)(questionIds) },
        });
        let order = body.order;
        if (body.chapterId) {
            // If chapterId is provided, get the next order from the chapter
            order = await this.chapterService.getNextOrder(body.chapterId);
        }
        const assignment = this.assignmentRepository.create({
            ...body,
            course,
            questions,
            questions_scores: question_scores,
            total_points,
            order: order || 1,
            chapter: body.chapterId ? { id: body.chapterId } : undefined,
        });
        return await this.assignmentRepository.save(assignment);
    }
    async getAssignmentsByCourse(courseId) {
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        return await this.assignmentRepository.find({
            where: { course: { id: courseId } },
            order: { order: "ASC" },
            relations: ["course", "chapter", "questions"],
        });
    }
    async getAssignmentsByChapter(chapterId) {
        if (!chapterId) {
            throw new Error("Chapter ID is required");
        }
        return await this.assignmentRepository.find({
            where: { chapter: { id: chapterId } },
            order: { order: "ASC" },
            relations: ["course", "chapter", "questions"],
        });
    }
    async getAssignmentById(assignmentId) {
        if (!assignmentId) {
            throw new Error("Assignment ID is required");
        }
        const assignment = await this.assignmentRepository.findOne({
            where: { id: assignmentId },
            relations: ["course", "chapter", "questions"],
        });
        if (!assignment) {
            throw new Error("Assignment not found");
        }
        return assignment;
    }
    async updateAssignment(assignmentId, body) {
        if (!assignmentId) {
            throw new Error("Assignment ID is required");
        }
        const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
        if (!assignment) {
            throw new Error("Assignment not found");
        }
        if (body.question_scores) {
            // Validate question_scores if provided
            const questionIds = body.questionIds || (await this.assignmentRepository.findOne({
                where: { id: assignmentId },
                relations: ["questions"],
            })).questions.map((q) => q.id);
            for (const questionId of questionIds) {
                if (body.question_scores[questionId] === undefined ||
                    body.question_scores[questionId] <= 0) {
                    throw new Error(`Invalid or missing points for question ID ${questionId}`);
                }
            }
            body.total_points = Object.values(body.question_scores).reduce((sum, points) => sum + points, 0);
        }
        Object.assign(assignment, body);
        return await this.assignmentRepository.save(assignment);
    }
    async deleteAssignment(assignmentId) {
        if (!assignmentId) {
            throw new Error("Assignment ID is required");
        }
        const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
        if (!assignment) {
            throw new Error("Assignment not found");
        }
        await this.assignmentRepository.remove(assignment);
        return { message: "Assignment deleted successfully" };
    }
}
exports.default = AssignmentService;
