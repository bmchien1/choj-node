"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterService = void 0;
const Chapter_1 = require("../entities/Chapter");
const Course_1 = require("../entities/Course");
const data_source_1 = require("../data-source");
const Lesson_1 = require("../entities/Lesson");
const Assignment_1 = require("../entities/Assignment");
class ChapterService {
    constructor() {
        this.chapterRepository = data_source_1.AppDataSource.getRepository(Chapter_1.Chapter);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.lessonRepository = data_source_1.AppDataSource.getRepository(Lesson_1.Lesson);
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(Assignment_1.Assignment);
    }
    static getInstance() {
        if (!ChapterService.instance) {
            ChapterService.instance = new ChapterService();
        }
        return ChapterService.instance;
    }
    async createChapter(courseId, body) {
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
    async getChaptersByCourse(courseId) {
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        return await this.chapterRepository.find({
            where: { course: { id: courseId } },
            order: { order: "ASC" },
            relations: ["course", "lessons", "assignments"],
        });
    }
    async getChapterById(chapterId) {
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
    async updateChapter(chapterId, body) {
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
    async deleteChapter(chapterId) {
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
    async updateChapterOrder(chapterId, order) {
        const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
        if (!chapter) {
            throw new Error("Chapter not found");
        }
        chapter.order = order;
        return await this.chapterRepository.save(chapter);
    }
    async getNextOrder(chapterId) {
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
exports.ChapterService = ChapterService;
