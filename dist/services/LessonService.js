"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonService = void 0;
const Lesson_1 = require("../entities/Lesson");
const Course_1 = require("../entities/Course");
const data_source_1 = require("../data-source");
const ChapterService_1 = require("./ChapterService");
class LessonService {
    constructor() {
        this.lessonRepository = data_source_1.AppDataSource.getRepository(Lesson_1.Lesson);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.chapterService = ChapterService_1.ChapterService.getInstance();
    }
    static getInstance() {
        if (!LessonService.instance) {
            LessonService.instance = new LessonService();
        }
        return LessonService.instance;
    }
    async createLesson(courseId, body) {
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
        if (body.lessonType === Lesson_1.LessonType.VIDEO && !body.video_url) {
            throw new Error("Video URL is required for video lessons");
        }
        if (body.lessonType === Lesson_1.LessonType.JSON && body.content) {
            try {
                JSON.parse(JSON.stringify(body.content));
            }
            catch {
                throw new Error("Invalid JSON content");
            }
        }
        let order = body.order;
        if (body.chapterId) {
            // If chapterId is provided, get the next order from the chapter
            order = await this.chapterService.getNextOrder(body.chapterId);
        }
        const lesson = this.lessonRepository.create({
            title: body.title,
            description: body.description,
            file_url: body.file_url,
            order: order || 1,
            lessonType: body.lessonType,
            content: body.content,
            video_url: body.video_url,
            course: { id: courseId },
            chapter: body.chapterId ? { id: body.chapterId } : undefined,
        });
        return await this.lessonRepository.save(lesson);
    }
    async getLessonsByCourse(courseId) {
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        return await this.lessonRepository.find({
            where: { course: { id: courseId } },
            order: { order: "ASC" },
            relations: ["course", "chapter"],
        });
    }
    async getLessonsByChapter(chapterId) {
        if (!chapterId) {
            throw new Error("Chapter ID is required");
        }
        return await this.lessonRepository.find({
            where: { chapter: { id: chapterId } },
            order: { order: "ASC" },
            relations: ["course", "chapter"],
        });
    }
    async getLessonById(lessonId) {
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
    async updateLesson(lessonId, body) {
        if (!lessonId) {
            throw new Error("Lesson ID is required");
        }
        const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
        if (!lesson) {
            throw new Error("Lesson not found");
        }
        if (body.lessonType === Lesson_1.LessonType.VIDEO && !body.video_url) {
            throw new Error("Video URL is required for video lessons");
        }
        if (body.lessonType === Lesson_1.LessonType.JSON && body.content) {
            try {
                JSON.parse(JSON.stringify(body.content));
            }
            catch {
                throw new Error("Invalid JSON content");
            }
        }
        Object.assign(lesson, body);
        return await this.lessonRepository.save(lesson);
    }
    async deleteLesson(lessonId) {
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
exports.LessonService = LessonService;
