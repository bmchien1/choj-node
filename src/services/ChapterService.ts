import { Repository } from "typeorm";
import { Chapter } from "../entities/Chapter";
import { Course } from "../entities/Course";
import { AppDataSource } from "../data-source";
import { Lesson } from "../entities/Lesson";
import { Assignment } from "../entities/Assignment";

interface ChapterData {
  title: string;
  description: string;
  order: number;
}

class ChapterService {
  private readonly chapterRepository: Repository<Chapter>;
  private readonly courseRepository: Repository<Course>;
  private readonly lessonRepository: Repository<Lesson>;
  private readonly assignmentRepository: Repository<Assignment>;
  private static instance: ChapterService;

  constructor() {
    this.chapterRepository = AppDataSource.getRepository(Chapter);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.lessonRepository = AppDataSource.getRepository(Lesson);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
  }

  public static getInstance(): ChapterService {
    if (!ChapterService.instance) {
      ChapterService.instance = new ChapterService();
    }
    return ChapterService.instance;
  }

  async createChapter(courseId: number, body: ChapterData): Promise<Chapter> {
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    if (!body.title || !body.description || body.order === undefined) {
      throw new Error("Title, description, and order are required");
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new Error("Course not found");
    }

    const chapter = this.chapterRepository.create({
      ...body,
      course,
    });

    return await this.chapterRepository.save(chapter);
  }

  async getChaptersByCourse(courseId: number): Promise<Chapter[]> {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    return await this.chapterRepository.find({
      where: { course: { id: courseId } },
      order: { order: "ASC" },
      relations: ["course", "lessons", "assignments"],
    });
  }

  async getChapterById(chapterId: number): Promise<Chapter> {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: ["course", "lessons", "assignments"],
    });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    return chapter;
  }

  async updateChapter(chapterId: number, body: Partial<ChapterData>): Promise<Chapter> {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    Object.assign(chapter, body);
    return await this.chapterRepository.save(chapter);
  }

  async deleteChapter(chapterId: number): Promise<{ message: string }> {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    await this.chapterRepository.remove(chapter);
    return { message: "Chapter deleted successfully" };
  }

  async updateChapterOrder(chapterId: number, order: number): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    chapter.order = order;
    return await this.chapterRepository.save(chapter);
  }

  async getNextOrder(chapterId: number): Promise<number> {
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: ["course"],
    });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const lastChapter = await this.chapterRepository.findOne({
      where: { course: { id: chapter.course.id } },
      order: { order: "DESC" },
    });

    return lastChapter ? lastChapter.order + 1 : 1;
  }
}

export { ChapterService }; //