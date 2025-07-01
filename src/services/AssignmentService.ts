import { In, Repository } from "typeorm";
import { Assignment } from "../entities/Assignment";
import { Course } from "../entities/Course";
import { Matrix } from "../entities/Matrix";
import { AppDataSource } from "../data-source";
import { Question } from "../entities/Question";
import { Tag } from "../entities/Tag";
import { ChapterService } from "./ChapterService";
import { Chapter } from "../entities/Chapter";
import { Lesson } from "../entities/Lesson";
import { IsNull } from "typeorm";

interface AssignmentData {
  title: string;
  description: string;
  duration?: number;
  total_points?: number;
  order?: number;
  questionIds?: number[];
  question_scores?: { [questionId: number]: number };
  chapterId?: number;
}

interface MatrixAssignmentCheck {
  isValid: boolean;
  message: string;
  selectedQuestions?: { [criterionIndex: number]: Question[] };
}

class AssignmentService {
  private readonly assignmentRepository: Repository<Assignment>;
  private readonly courseRepository: Repository<Course>;
  private readonly questionRepository: Repository<Question>;
  private readonly matrixRepository: Repository<Matrix>;
  private readonly tagRepository: Repository<Tag>;
  private readonly chapterService: ChapterService;
  private readonly chapterRepository: Repository<Chapter>;
  private static instance: AssignmentService;

  private constructor() {
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.questionRepository = AppDataSource.getRepository(Question);
    this.matrixRepository = AppDataSource.getRepository(Matrix);
    this.tagRepository = AppDataSource.getRepository(Tag);
    this.chapterService = ChapterService.getInstance();
    this.chapterRepository = AppDataSource.getRepository(Chapter);
  }

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  async createAssignment(courseId: number, body: AssignmentData): Promise<Assignment> {
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
    const total_points = Object.values(body.question_scores).reduce((sum: number, score: number) => sum + score, 0);

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
      const lessonOrders = (chapter.lessons || []).map((l: Lesson) => l.order || 0);
      const assignmentOrders = (chapter.assignments || []).map((a: Assignment) => a.order || 0);
      order = Math.max(...lessonOrders, ...assignmentOrders, 0) + 1;
    } else {
      // If no chapterId, get the next order from the course
      const assignments = await this.assignmentRepository.find({
        where: { 
          course: { id: courseId },
          chapter: IsNull()
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

  async checkMatrixAssignment(
    courseId: number,
    matrixId: number,
    teacherId: number
  ): Promise<MatrixAssignmentCheck> {
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

    const selectedQuestions: { [criterionIndex: number]: Question[] } = {};
    for (let i = 0; i < matrix.criteria.length; i++) {
      const criterion = matrix.criteria[i];

      // Validate tagIds exist
      const tags = await this.tagRepository.findBy({ id: In(criterion.tagIds) });
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

  async createAssignmentFromMatrix(
    courseId: number,
    matrixId: number,
    teacherId: number,
    body: Omit<AssignmentData, "questionIds" | "question_scores" | "total_points">
  ): Promise<Assignment> {
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

    const questionIds: number[] = [];
    const question_scores: { [questionId: number]: number } = {};
    const total_points = matrix.total_points || 100; // Default to 100 if not specified

    for (const criterion of matrix.criteria) {
      // Validate tagIds exist
      const tags = await this.tagRepository.findBy({ id: In(criterion.tagIds) });
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
        throw new Error(
          `No questions found for criterion: ${criterion.questionType}, ${criterion.difficulty_level}, Tags: ${tagNames}`
        );
      }

      // Check if we have enough questions for the required quantity
      if (questions.length < criterion.quantity) {
        const tagNames = tags.map((tag) => tag.name).join(", ");
        throw new Error(
          `Not enough questions for criterion: ${criterion.questionType}, ${criterion.difficulty_level}, Tags: ${tagNames}. Required: ${criterion.quantity}, Available: ${questions.length}`
        );
      }

      // Shuffle questions and select the required quantity
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, criterion.quantity);
      
      // Calculate points per question for this criterion
      const pointsPerQuestion = (criterion.percentage / 100) * total_points / criterion.quantity;
      
      // Add selected questions to the assignment
      for (const question of selectedQuestions) {
      questionIds.push(question.id);
        question_scores[question.id] = pointsPerQuestion;
      }
    }

    const questions = await this.questionRepository.find({
      where: { id: In(questionIds) },
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

  async getAssignmentsByCourse(courseId: number): Promise<Assignment[]> {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    return await this.assignmentRepository.find({
      where: { course: { id: courseId } },
      order: { order: "ASC" },
      relations: ["course", "chapter", "questions"],
    });
  }

  async getAssignmentsByChapter(chapterId: number): Promise<Assignment[]> {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    return await this.assignmentRepository.find({
      where: { chapter: { id: chapterId } },
      order: { order: "ASC" },
      relations: ["course", "chapter", "questions"],
    });
  }

  async getAssignmentById(assignmentId: number): Promise<Assignment> {
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

  async updateAssignment(assignmentId: number, body: Partial<AssignmentData>): Promise<Assignment> {
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
      }))!.questions.map((q) => q.id);
      for (const questionId of questionIds) {
        if (
          body.question_scores[questionId] === undefined ||
          body.question_scores[questionId] <= 0
        ) {
          throw new Error(`Invalid or missing points for question ID ${questionId}`);
        }
      }
      body.total_points = Object.values(body.question_scores).reduce(
        (sum, points) => sum + points,
        0
      );
    }

    Object.assign(assignment, body);
    return await this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(assignmentId: number): Promise<{ message: string }> {
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

export default AssignmentService;//