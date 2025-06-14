import { Repository } from "typeorm";
import { Tag } from "../entities/Tag";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Question } from "../entities/Question";

interface TagData {
  name: string;
  creatorId: number;
}

class TagService {
  private readonly tagRepository: Repository<Tag>;
  private readonly userRepository: Repository<User>;
  private readonly questionRepository: Repository<Question>;
  private static instance: TagService;

  constructor() {
    this.tagRepository = AppDataSource.getRepository(Tag);
    this.userRepository = AppDataSource.getRepository(User);
    this.questionRepository = AppDataSource.getRepository(Question);
  }

  public static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  async createTag(body: TagData): Promise<Tag> {
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

  async getAllTags(): Promise<Partial<Tag>[]> {
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

  async getTagsByCreator(creatorId: number): Promise<Partial<Tag>[]> {
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

  async getTagById(id: number): Promise<Tag> {
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

  async updateTag(id: number, body: Partial<TagData>): Promise<Tag> {
    if (!id) {
      throw new Error('Tag ID is required');
    }

    const tag = await this.getTagById(id);
    tag.name = body.name ?? tag.name;

    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: number): Promise<{ message: string }> {
    if (!id) {
      throw new Error('Tag ID is required');
    }

    const tag = await this.getTagById(id);
    await this.tagRepository.remove(tag);
    return { message: "Tag deleted successfully" };
  }

  async addTagToQuestion(questionId: number, tagId: number): Promise<Question> {
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

export { TagService, TagData };