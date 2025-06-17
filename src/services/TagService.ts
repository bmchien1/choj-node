import { Repository } from "typeorm";
import { Tag } from "../entities/Tag";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Question } from "../entities/Question";

interface TagData {
  name: string;
  description: string;
  creatorId: number;
}

interface TagQueryOptions {
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
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

  async getAllTagsPaginated(skip: number, take: number, options?: TagQueryOptions): Promise<[Tag[], number]> {
    const queryBuilder = this.tagRepository.createQueryBuilder("tag")
      .leftJoinAndSelect("tag.creator", "creator");

    if (options?.search) {
      queryBuilder.where(
        "(tag.name ILIKE :search OR tag.description ILIKE :search)",
        { search: `%${options.search}%` }
      );
    }

    if (options?.sortField) {
      const order = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`tag.${options.sortField}`, order);
    } else {
      queryBuilder.orderBy("tag.name", "ASC");
    }

    return queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async getTagsByCreatorPaginated(creatorId: number, skip: number, take: number, options?: TagQueryOptions): Promise<[Tag[], number]> {
    const queryBuilder = this.tagRepository.createQueryBuilder("tag")
      .leftJoinAndSelect("tag.creator", "creator")
      .where("creator.id = :creatorId", { creatorId });

    if (options?.search) {
      queryBuilder.andWhere(
        "(tag.name ILIKE :search OR tag.description ILIKE :search)",
        { search: `%${options.search}%` }
      );
    }

    if (options?.sortField) {
      const order = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`tag.${options.sortField}`, order);
    } else {
      queryBuilder.orderBy("tag.name", "ASC");
    }

    return queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async getTagById(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ["creator"],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    return tag;
  }

  async updateTag(id: number, body: Partial<TagData>): Promise<Tag> {
    const tag = await this.getTagById(id);

    if (body.name) tag.name = body.name;
    if (body.description) tag.description = body.description;

    return this.tagRepository.save(tag);
  }

  async deleteTag(id: number): Promise<{ message: string }> {
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

export default TagService;//