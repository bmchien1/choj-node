import { Repository, In } from "typeorm";
import { Question } from "../entities/Question";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Tag } from "../entities/Tag";

interface QuestionData {
  questionName: string;
  questionType: "multiple-choice" | "short-answer" | "true-false" | "coding";
  difficulty_level: string;
  question: string;
  creatorId: number;
  question_image_url?: string;
  choices?: any;
  correctAnswer?: string;
  templateCode?: string;
  testCases?: { input: string; output: string }[];
  language?: string;
  cpuTimeLimit?: number;
  memoryLimit?: number;
  tagIds?: number[];
}

interface QuestionResponse {
  id: number;
  questionName: string;
  questionType: string;
  question: string;
  difficulty_level: string;
  creatorName: string;
  tags: { id: number; name: string; creatorId: number; creatorName: string }[];
}

class QuestionService {
  private readonly questionRepository: Repository<Question>;
  private readonly userRepository: Repository<User>;
  private readonly tagRepository: Repository<Tag>;
  private static instance: QuestionService;

  constructor() {
    this.questionRepository = AppDataSource.getRepository(Question);
    this.userRepository = AppDataSource.getRepository(User);
    this.tagRepository = AppDataSource.getRepository(Tag);
  }

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  async createQuestion(body: QuestionData): Promise<Question> {
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

    let creator: User | null;
    if (body.creatorId) {
      creator = await this.userRepository.findOne({ where: { id: body.creatorId } });
      if (!creator) {
        throw new Error(`User with ID ${body.creatorId} not found`);
      }
    } else {
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
      testCases: body.testCases?.map((tc: { input: any; output: any; }) => ({
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
      const tags = await this.tagRepository.findBy({ id: In(body.tagIds) });
      savedQuestion.tags = tags;
      await this.questionRepository.save(savedQuestion);
    }

    return savedQuestion;
  }

  async getQuestionById(id: number): Promise<Question> {
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

  async getAllQuestionsPaginated(
    skip: number, 
    take: number,
    search?: string,
    sortField?: string,
    sortOrder?: 'ascend' | 'descend',
    difficulty?: string,
    type?: string,
    tags?: number[]
  ): Promise<[Question[], number]> {
    const queryBuilder = this.questionRepository.createQueryBuilder('question')
      .leftJoinAndSelect('question.creator', 'creator')
      .leftJoinAndSelect('question.tags', 'tags')
      .leftJoinAndSelect('tags.creator', 'tagCreator');

    if (search) {
      queryBuilder.andWhere(
        '(question.questionName ILIKE :search OR question.question ILIKE :search)',
        { search: `%${search}%` }
      );
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

  async getQuestionsByCreatorPaginated(
    creatorId: number, 
    skip: number, 
    take: number,
    search?: string,
    sortField?: string,
    sortOrder?: 'ascend' | 'descend',
    difficulty?: string,
    type?: string,
    tags?: number[]
  ): Promise<[Question[], number]> {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    const queryBuilder = this.questionRepository.createQueryBuilder('question')
      .leftJoinAndSelect('question.creator', 'creator')
      .leftJoinAndSelect('question.tags', 'tags')
      .leftJoinAndSelect('tags.creator', 'tagCreator')
      .where('creator.id = :creatorId', { creatorId });

    if (search) {
      queryBuilder.andWhere(
        '(question.questionName ILIKE :search OR question.question ILIKE :search)',
        { search: `%${search}%` }
      );
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

  async updateQuestion(id: number, body: Partial<QuestionData>): Promise<Question> {
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
      const tags = await this.tagRepository.findBy({ id: In(body.tagIds) });
      updatedQuestion.tags = tags;
    }

    return await this.questionRepository.save(updatedQuestion);
  }

  async deleteQuestion(id: number): Promise<{ message: string }> {
    if (!id) {
      throw new Error('Question ID is required');
    }

    const question = await this.getQuestionById(id);
    await this.questionRepository.remove(question);
    return { message: "Question deleted successfully" };
  }
}

export { QuestionService, QuestionData, QuestionResponse };