"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const UserLesson_1 = require("../entities/UserLesson");
const User_1 = require("../entities/User");
const Lesson_1 = require("../entities/Lesson");
class UserLessonService {
    constructor() {
        this.userLessonRepository = data_source_1.AppDataSource.getRepository(UserLesson_1.UserLesson);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.lessonRepository = data_source_1.AppDataSource.getRepository(Lesson_1.Lesson);
    }
    static getInstance() {
        if (!UserLessonService.instance) {
            UserLessonService.instance = new UserLessonService();
        }
        return UserLessonService.instance;
    }
    async markCompleted(userId, lessonId, completed) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
        if (!user || !lesson)
            throw new Error("User or Lesson not found");
        let userLesson = await this.userLessonRepository.findOne({ where: { user: { id: userId }, lesson: { id: lessonId } } });
        if (!userLesson) {
            userLesson = this.userLessonRepository.create({ user, lesson, completed });
        }
        else {
            userLesson.completed = completed;
        }
        return await this.userLessonRepository.save(userLesson);
    }
    async getCompletedLessons(userId) {
        return await this.userLessonRepository.find({ where: { user: { id: userId }, completed: true } });
    }
    async isLessonCompleted(userId, lessonId) {
        const userLesson = await this.userLessonRepository.findOne({ where: { user: { id: userId }, lesson: { id: lessonId } } });
        return !!userLesson?.completed;
    }
}
exports.default = UserLessonService;
