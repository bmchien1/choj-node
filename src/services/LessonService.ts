import { Repository } from "typeorm";
import { Lesson, LessonType } from "../entities/Lesson";
import { Course } from "../entities/Course";
import { AppDataSource } from "../data-source";
import { ChapterService } from "./ChapterService";
import { Chapter } from "../entities/Chapter";
import { Assignment } from "../entities/Assignment";
import { IsNull } from "typeorm";

interface LessonData {
  title: string;
  description: string;
  file_url?: string;
  order?: number;
  lessonType: LessonType;
  content?: any;
  video_url?: string;
  chapterId?: number;
}

class LessonService {
  private readonly lessonRepository: Repository<Lesson>;
  private readonly courseRepository: Repository<Course>;
  private readonly chapterService: ChapterService;
  private readonly chapterRepository: Repository<Chapter>;
  private static instance: LessonService;

  constructor() {
    this.lessonRepository = AppDataSource.getRepository(Lesson);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.chapterService = ChapterService.getInstance();
    this.chapterRepository = AppDataSource.getRepository(Chapter);
  }

  public static getInstance(): LessonService {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService();
    }
    return LessonService.instance;
  }

  async createLesson(courseId: number, body: LessonData): Promise<Lesson> {
    if (!courseId) {
      throw new Error("Course ID is required");
    }
    if (!body.title || !body.description) {
      throw new Error("Title and description are required");
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new Error("Course not found");
    }

    if (body.lessonType === LessonType.VIDEO && !body.video_url) {
      throw new Error("Video URL is required for video lessons");
    }

    if (body.lessonType === LessonType.JSON && body.content) {
      try {
        JSON.parse(JSON.stringify(body.content));
      } catch {
        throw new Error("Invalid JSON content");
      }
    }

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
      const lessons = await this.lessonRepository.find({
        where: { 
          course: { id: courseId },
          chapter: IsNull()
        },
        order: { order: "DESC" },
      });
      order = lessons.length > 0 ? lessons[0].order + 1 : 1;
    }

    const lesson = this.lessonRepository.create({
      title: body.title,
      description: body.description,
      file_url: body.file_url,
      order: order,
      lessonType: body.lessonType,
      content: body.content,
      video_url: body.video_url,
      course: { id: courseId },
      chapter: body.chapterId ? { id: body.chapterId } : undefined,
    });

    return await this.lessonRepository.save(lesson);
  }

  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    return await this.lessonRepository.find({
      where: { course: { id: courseId } },
      order: { order: "ASC" },
      relations: ["course", "chapter"],
    });
  }

  async getLessonsByChapter(chapterId: number): Promise<Lesson[]> {
    if (!chapterId) {
      throw new Error("Chapter ID is required");
    }

    return await this.lessonRepository.find({
      where: { chapter: { id: chapterId } },
      order: { order: "ASC" },
      relations: ["course", "chapter"],
    });
  }

  async getLessonById(lessonId: number): Promise<Lesson> {
    if (!lessonId) {
      throw new Error("Lesson ID is required");
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ["course", "chapter"],
    });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    return lesson;
  }

  async updateLesson(lessonId: number, body: Partial<LessonData>): Promise<Lesson> {
    if (!lessonId) {
      throw new Error("Lesson ID is required");
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (body.lessonType === LessonType.VIDEO && !body.video_url) {
      throw new Error("Video URL is required for video lessons");
    }

    if (body.lessonType === LessonType.JSON && body.content) {
      try {
        JSON.parse(JSON.stringify(body.content));
      } catch {
        throw new Error("Invalid JSON content");
      }
    }

    Object.assign(lesson, body);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(lessonId: number): Promise<{ message: string }> {
    if (!lessonId) {
      throw new Error("Lesson ID is required");
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    await this.lessonRepository.remove(lesson);
    return { message: "Lesson deleted successfully" };
  }
}

export { LessonService };//