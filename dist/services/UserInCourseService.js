"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInCourseService = void 0;
const UserInCourse_1 = require("../entities/UserInCourse");
const data_source_1 = require("../data-source");
class UserInCourseService {
    constructor() {
        this.userInCourseRepository = data_source_1.AppDataSource.getRepository(UserInCourse_1.UserInCourse);
    }
    static getInstance() {
        if (!UserInCourseService.instance) {
            UserInCourseService.instance = new UserInCourseService();
        }
        return UserInCourseService.instance;
    }
    async getAllUserInCourseByUserId(userId) {
        const userInCourses = await this.userInCourseRepository.find({
            where: { user: { id: userId } },
            relations: ["user", "course"],
        });
        if (!userInCourses.length) {
            throw new Error("No courses found for this user");
        }
        return userInCourses;
    }
}
exports.UserInCourseService = UserInCourseService;
