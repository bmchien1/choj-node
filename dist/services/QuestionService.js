"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const typeorm_1 = require("typeorm");
const Question_1 = require("../entities/Question");
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const Tag_1 = require("../entities/Tag");
class QuestionService {
    constructor() {
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.tagRepository = data_source_1.AppDataSource.getRepository(Tag_1.Tag);
    }
    static getInstance() {
        if (!QuestionService.instance) {
            QuestionService.instance = new QuestionService();
        }
        return QuestionService.instance;
    }
    async createQuestion(body) {
        if (!body.questionName || !body.questionType || !body.question || !body.difficulty_level) {
            throw new Error('Required question fields (questionName, questionType, question, difficulty_level) are missing');
        }
        switch (body.questionType) {
            case "multiple-choice":
                if (!body.choices?.length || !body.correctAnswer) {
                    throw new Error('Choices and correctAnswer are required for multiple-choice questions');
                }
                break;
            case "short-answer":
                if (!body.correctAnswer) {
                    throw new Error('correctAnswer is required for short-answer questions');
                }
                break;
            case "true-false":
                if (!body.choices?.length || body.correctAnswer === undefined) {
                    throw new Error('Choices and correctAnswer are required for true-false questions');
                }
                break;
            case "coding":
                if (!body.testCases?.length) {
                    throw new Error('Test cases are required for coding questions');
                }
                break;
            default:
                throw new Error(`Unsupported question type: ${body.questionType}`);
        }
        let creator;
        if (body.creatorId) {
            creator = await this.userRepository.findOne({ where: { id: body.creatorId } });
            if (!creator) {
                throw new Error(`User with ID ${body.creatorId} not found`);
            }
        }
        else {
            throw new Error('creatorId is required');
        }
        const question = this.questionRepository.create({
            questionName: body.questionName,
            questionType: body.questionType,
            difficulty_level: body.difficulty_level,
            question: body.question,
            choices: body.choices,
            correctAnswer: body.correctAnswer?.toString(),
            templateCode: body.templateCode,
            testCases: body.testCases?.map((tc) => ({
                input: tc.input,
                output: tc.output,
            })),
            cpuTimeLimit: body.cpuTimeLimit,
            memoryLimit: body.memoryLimit,
            creator,
            tags: [],
        });
        const savedQuestion = await this.questionRepository.save(question);
        if (body.tagIds?.length) {
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(body.tagIds) });
            savedQuestion.tags = tags;
            await this.questionRepository.save(savedQuestion);
        }
        return savedQuestion;
    }
    async getQuestionById(id) {
        if (!id) {
            throw new Error('Question ID is required');
        }
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['tests', 'assignments', 'tags', 'tags.creator', 'creator'],
        });
        if (!question) {
            throw new Error(`Question with ID ${id} not found`);
        }
        return question;
    }
    async getAllQuestionsPaginated(skip, take, search, sortField, sortOrder, difficulty, type, tags) {
        const queryBuilder = this.questionRepository.createQueryBuilder('question')
            .leftJoinAndSelect('question.creator', 'creator')
            .leftJoinAndSelect('question.tags', 'tags')
            .leftJoinAndSelect('tags.creator', 'tagCreator');
        if (search) {
            queryBuilder.andWhere('(question.questionName ILIKE :search OR question.question ILIKE :search)', { search: `%${search}%` });
        }
        if (difficulty) {
            queryBuilder.andWhere('question.difficulty_level = :difficulty', { difficulty });
        }
        if (type) {
            queryBuilder.andWhere('question.questionType = :type', { type });
        }
        if (tags && tags.length > 0) {
            queryBuilder.andWhere('tags.id IN (:...tags)', { tags });
        }
        if (sortField) {
            const order = sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`question.${sortField}`, order);
        }
        return await queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async getQuestionsByCreatorPaginated(creatorId, skip, take, search, sortField, sortOrder, difficulty, type, tags) {
        if (!creatorId) {
            throw new Error("Creator ID is required");
        }
        const queryBuilder = this.questionRepository.createQueryBuilder('question')
            .leftJoinAndSelect('question.creator', 'creator')
            .leftJoinAndSelect('question.tags', 'tags')
            .leftJoinAndSelect('tags.creator', 'tagCreator')
            .where('creator.id = :creatorId', { creatorId });
        if (search) {
            queryBuilder.andWhere('(question.questionName ILIKE :search OR question.question ILIKE :search)', { search: `%${search}%` });
        }
        if (difficulty) {
            queryBuilder.andWhere('question.difficulty_level = :difficulty', { difficulty });
        }
        if (type) {
            queryBuilder.andWhere('question.questionType = :type', { type });
        }
        if (tags && tags.length > 0) {
            queryBuilder.andWhere('tags.id IN (:...tags)', { tags });
        }
        if (sortField) {
            const order = sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`question.${sortField}`, order);
        }
        return await queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async updateQuestion(id, body) {
        if (!id) {
            throw new Error('Question ID is required');
        }
        const question = await this.getQuestionById(id);
        if (body.questionType && body.questionType !== question.questionType) {
            switch (body.questionType) {
                case "multiple-choice":
                    if (!body.choices?.length || !body.correctAnswer) {
                        throw new Error('Choices and correctAnswer are required when changing to multiple-choice');
                    }
                    break;
                case "short-answer":
                    if (!body.correctAnswer) {
                        throw new Error('correctAnswer is required when changing to short-answer');
                    }
                    break;
                case "true-false":
                    if (!body.choices?.length) {
                        throw new Error('Choices are required when changing to true-false');
                    }
                    break;
                case "coding":
                    if (!body.testCases?.length) {
                        throw new Error('Test cases are required when changing to coding');
                    }
                    break;
                default:
                    throw new Error(`Unsupported question type: ${body.questionType}`);
            }
        }
        const updatedQuestion = Object.assign(question, {
            questionName: body.questionName ?? question.questionName,
            questionType: body.questionType ?? question.questionType,
            difficulty_level: body.difficulty_level ?? question.difficulty_level,
            question: body.question ?? question.question,
            question_image_url: body.question_image_url ?? question.question_image_url,
            choices: body.choices ?? question.choices,
            correctAnswer: body.correctAnswer ?? question.correctAnswer,
            templateCode: body.templateCode ?? question.templateCode,
            testCases: body.testCases ?? question.testCases,
            cpuTimeLimit: body.cpuTimeLimit ?? question.cpuTimeLimit,
            memoryLimit: body.memoryLimit ?? question.memoryLimit,
        });
        if (body.tagIds) {
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(body.tagIds) });
            updatedQuestion.tags = tags;
        }
        return await this.questionRepository.save(updatedQuestion);
    }
    async deleteQuestion(id) {
        if (!id) {
            throw new Error('Question ID is required');
        }
        const question = await this.getQuestionById(id);
        await this.questionRepository.remove(question);
        return { message: "Question deleted successfully" };
    }
}
exports.QuestionService = QuestionService;
