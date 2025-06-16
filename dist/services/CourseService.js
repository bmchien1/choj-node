"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const typeorm_1 = require("typeorm");
const Course_1 = require("../entities/Course");
const User_1 = require("../entities/User");
const data_source_1 = require("../data-source");
const Chapter_1 = require("../entities/Chapter");
class CourseService {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.chapterRepository = data_source_1.AppDataSource.getRepository(Chapter_1.Chapter);
    }
    static getInstance() {
        if (!CourseService.instance) {
            CourseService.instance = new CourseService();
        }
        return CourseService.instance;
    }
    async createCourse(body) {
        const { name, description, class: className, subject, creatorId } = body;
        if (!name || !description || !className || !subject || !creatorId) {
            throw new Error("All course fields are required");
        }
        const user = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!user) {
            throw new Error("Creator user not found");
        }
        const course = this.courseRepository.create({
            name,
            description,
            class: className,
            subject,
            creator: user,
        });
        return await this.courseRepository.save(course);
    }
    async getAllCoursesPaginated(skip, take, options) {
        const where = {};
        if (options?.search) {
            where.name = (0, typeorm_1.Like)(`%${options.search}%`);
        }
        if (options?.class) {
            where.class = options.class;
        }
        if (options?.subject) {
            where.subject = options.subject;
        }
        const order = {};
        if (options?.sortField) {
            order[options.sortField] = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
        }
        else {
            order.createdAt = 'DESC';
        }
        return await this.courseRepository.findAndCount({
            where,
            order,
            skip,
            take,
            relations: ["creator"]
        });
    }
    async getCoursesByCreatorPaginated(creatorId, skip, take, options) {
        const where = {
            creator: { id: creatorId }
        };
        if (options?.search) {
            where.name = (0, typeorm_1.Like)(`%${options.search}%`);
        }
        if (options?.class) {
            where.class = options.class;
        }
        if (options?.subject) {
            where.subject = options.subject;
        }
        const order = {};
        if (options?.sortField) {
            order[options.sortField] = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
        }
        else {
            order.createdAt = 'DESC';
        }
        return await this.courseRepository.findAndCount({
            where,
            order,
            skip,
            take,
            relations: ["creator"]
        });
    }
    async getAllCourses() {
        return await this.courseRepository.find({ relations: ["creator"] });
    }
    async getCourseById(id) {
        if (!id) {
            throw new Error("Course ID is required");
        }
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ["creator", "chapters", "chapters.lessons", "chapters.assignments"]
        });
        if (!course) {
            throw new Error("Course not found");
        }
        return course;
    }
    async getCourseByCreator(creatorId) {
        if (!creatorId) {
            throw new Error("Creator ID is required");
        }
        const courses = await this.courseRepository.find({
            where: { creator: { id: creatorId } },
            relations: ["creator"],
        });
        return courses;
    }
    async updateCourse(id, body) {
        if (!id) {
            throw new Error("Course ID is required");
        }
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new Error("Course not found");
        }
        Object.assign(course, body);
        return await this.courseRepository.save(course);
    }
    async deleteCourse(id) {
        if (!id) {
            throw new Error("Course ID is required");
        }
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) {
            throw new Error("Course not found");
        }
        await this.courseRepository.remove(course);
        return { message: "Course deleted successfully" };
    }
    async getCourseContent(courseId) {
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        const chapters = await this.chapterRepository.find({
            where: { course: { id: courseId } },
            relations: ["lessons", "assignments"],
        });
        const content = chapters.flatMap(chapter => [
            ...chapter.lessons.map(lesson => ({
                type: "lesson",
                id: lesson.id,
                title: lesson.title,
                order: lesson.order,
                chapterId: chapter.id
            })),
            ...chapter.assignments.map(assignment => ({
                type: "assignment",
                id: assignment.id,
                title: assignment.title,
                order: assignment.order,
                chapterId: chapter.id
            }))
        ]);
        return content.sort((a, b) => a.order - b.order);
    }
}
exports.CourseService = CourseService;
