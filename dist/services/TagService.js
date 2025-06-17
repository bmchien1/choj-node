"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const creator = await this.userRepository.findOne({
            where: { id: body.creatorId },
        });
        if (!creator) {
            throw new Error("Creator not found");
        }
        const tag = this.tagRepository.create({
            name: body.name,
            description: body.description,
            creator,
        });
        return this.tagRepository.save(tag);
    }
    async getAllTagsPaginated(skip, take, options) {
        const queryBuilder = this.tagRepository.createQueryBuilder("tag")
            .leftJoinAndSelect("tag.creator", "creator");
        if (options?.search) {
            queryBuilder.where("(tag.name ILIKE :search OR tag.description ILIKE :search)", { search: `%${options.search}%` });
        }
        if (options?.sortField) {
            const order = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`tag.${options.sortField}`, order);
        }
        else {
            queryBuilder.orderBy("tag.name", "ASC");
        }
        return queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async getTagsByCreatorPaginated(creatorId, skip, take, options) {
        const queryBuilder = this.tagRepository.createQueryBuilder("tag")
            .leftJoinAndSelect("tag.creator", "creator")
            .where("creator.id = :creatorId", { creatorId });
        if (options?.search) {
            queryBuilder.andWhere("(tag.name ILIKE :search OR tag.description ILIKE :search)", { search: `%${options.search}%` });
        }
        if (options?.sortField) {
            const order = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`tag.${options.sortField}`, order);
        }
        else {
            queryBuilder.orderBy("tag.name", "ASC");
        }
        return queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async getTagById(id) {
        const tag = await this.tagRepository.findOne({
            where: { id },
            relations: ["creator"],
        });
        if (!tag) {
            throw new Error("Tag not found");
        }
        return tag;
    }
    async updateTag(id, body) {
        const tag = await this.getTagById(id);
        if (body.name)
            tag.name = body.name;
        if (body.description)
            tag.description = body.description;
        return this.tagRepository.save(tag);
    }
    async deleteTag(id) {
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
exports.default = TagService; //
