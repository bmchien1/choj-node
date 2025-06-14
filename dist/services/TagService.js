"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagService = void 0;
const Tag_1 = require("../entities/Tag");
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const Question_1 = require("../entities/Question");
class TagService {
    constructor() {
        this.tagRepository = data_source_1.AppDataSource.getRepository(Tag_1.Tag);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.questionRepository = data_source_1.AppDataSource.getRepository(Question_1.Question);
    }
    static getInstance() {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }
        return TagService.instance;
    }
    async createTag(body) {
        if (!body.name || !body.creatorId) {
            throw new Error('Name and creatorId are required');
        }
        const creator = await this.userRepository.findOne({ where: { id: body.creatorId } });
        if (!creator) {
            throw new Error(`User with ID ${body.creatorId} not found`);
        }
        const tag = this.tagRepository.create({
            name: body.name,
            creator,
        });
        return await this.tagRepository.save(tag);
    }
    async getAllTags() {
        const tags = await this.tagRepository.find({
            select: ['id', 'name'],
            relations: ['creator'],
            relationLoadStrategy: 'query',
        });
        return tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            creatorId: tag.creator?.id ?? 0,
            creatorName: tag.creator?.email ?? 'Unknown',
        }));
    }
    async getTagsByCreator(creatorId) {
        if (!creatorId) {
            throw new Error('Creator ID is required');
        }
        const tags = await this.tagRepository.find({
            where: { creator: { id: creatorId } },
            select: ['id', 'name'],
            relations: ['creator'],
            relationLoadStrategy: 'query',
        });
        return tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            creatorId: tag.creator?.id ?? 0,
            creatorName: tag.creator?.email ?? 'Unknown',
        }));
    }
    async getTagById(id) {
        if (!id) {
            throw new Error('Tag ID is required');
        }
        const tag = await this.tagRepository.findOne({
            where: { id },
            relations: ['creator'],
        });
        if (!tag) {
            throw new Error(`Tag with ID ${id} not found`);
        }
        return tag;
    }
    async updateTag(id, body) {
        if (!id) {
            throw new Error('Tag ID is required');
        }
        const tag = await this.getTagById(id);
        tag.name = body.name ?? tag.name;
        return await this.tagRepository.save(tag);
    }
    async deleteTag(id) {
        if (!id) {
            throw new Error('Tag ID is required');
        }
        const tag = await this.getTagById(id);
        await this.tagRepository.remove(tag);
        return { message: "Tag deleted successfully" };
    }
    async addTagToQuestion(questionId, tagId) {
        if (!questionId || !tagId) {
            throw new Error('Question ID and Tag ID are required');
        }
        const question = await this.questionRepository.findOne({
            where: { id: questionId },
            relations: ['tags'],
        });
        if (!question) {
            throw new Error(`Question with ID ${questionId} not found`);
        }
        const tag = await this.getTagById(tagId);
        question.tags = question.tags ? [...question.tags, tag] : [tag];
        return await this.questionRepository.save(question);
    }
}
exports.TagService = TagService;
