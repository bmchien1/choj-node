"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const Course_1 = require("../entities/Course");
const User_1 = require("../entities/User");
const data_source_1 = require("../data-source");
const Lesson_1 = require("../entities/Lesson");
const Assignment_1 = require("../entities/Assignment");
class CourseService {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.lessonRepository = data_source_1.AppDataSource.getRepository(Lesson_1.Lesson);
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(Assignment_1.Assignment);
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
    async getAllCoursesPaginated(skip, take) {
        return await this.courseRepository.findAndCount({
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
            relations: ["creator", "lessons", "assignments"]
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
        const lessons = await this.lessonRepository.find({
            where: { course: { id: courseId } },
            select: ["id", "title", "order"],
        });
        const assignments = await this.assignmentRepository.find({
            where: { course: { id: courseId } },
            select: ["id", "title", "order"],
        });
        const content = [
            ...lessons.map((lesson) => ({ type: "lesson", id: lesson.id, title: lesson.title, order: lesson.order })),
            ...assignments.map((assignment) => ({ type: "assignment", id: assignment.id, title: assignment.title, order: assignment.order })),
        ];
        return content.sort((a, b) => a.order - b.order);
    }
}
exports.CourseService = CourseService;
