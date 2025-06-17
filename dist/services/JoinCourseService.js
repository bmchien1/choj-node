"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinCourseService = void 0;
const Course_1 = require("../entities/Course");
const User_1 = require("../entities/User");
const data_source_1 = require("../data-source");
const JoinCourseRequest_1 = require("../entities/JoinCourseRequest");
const UserInCourse_1 = require("../entities/UserInCourse");
class JoinCourseService {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.joinCourseRequestRepository = data_source_1.AppDataSource.getRepository(JoinCourseRequest_1.JoinCourseRequest);
        this.userInCourseRepository = data_source_1.AppDataSource.getRepository(UserInCourse_1.UserInCourse);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    static getInstance() {
        if (!JoinCourseService.instance) {
            JoinCourseService.instance = new JoinCourseService();
        }
        return JoinCourseService.instance;
    }
    async createJoinRequest(userId, courseId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        console.log(user);
        console.log(course);
        if (!user) {
            throw new Error("User not found");
        }
        if (!course) {
            throw new Error("Course not found");
        }
        const existingRequest = await this.joinCourseRequestRepository.findOne({
            where: { user: { id: userId }, course: { id: courseId } },
        });
        if (existingRequest) {
            throw new Error("Request already exists for this course");
        }
        const joinRequest = new JoinCourseRequest_1.JoinCourseRequest();
        joinRequest.user = user;
        joinRequest.course = course;
        return await this.joinCourseRequestRepository.save(joinRequest);
    }
    async getJoinCourseRequestsByCreator(userId) {
        const courses = await this.courseRepository
            .createQueryBuilder("course")
            .where("course.creator = :userId", { userId })
            .getMany();
        if (courses.length === 0) {
            throw new Error("No courses found for the creator");
        }
        const joinRequests = await this.joinCourseRequestRepository
            .createQueryBuilder("request")
            .leftJoinAndSelect("request.user", "user")
            .leftJoinAndSelect("request.course", "course")
            .where("request.course.id IN (:...courseIds)", { courseIds: courses.map((course) => course.id) })
            .andWhere("request.approved = :approved", { approved: false })
            .getMany();
        return joinRequests;
    }
    async getAllJoinRequests() {
        const joinRequests = await this.joinCourseRequestRepository.find({
            relations: ["user", "course"],
        });
        if (!joinRequests.length) {
            throw new Error("No join requests found");
        }
        return joinRequests;
    }
    async approveOrRejectRequest(requestId, action) {
        const joinRequest = await this.joinCourseRequestRepository.findOne({
            where: { id: requestId },
            relations: ["user", "course"],
        });
        if (!joinRequest) {
            throw new Error("Join course request not found");
        }
        if (action === "approve") {
            // Check if the user is already enrolled in the course
            const existingEnrollment = await this.userInCourseRepository.findOne({
                where: {
                    user: { id: joinRequest.user.id },
                    course: { id: joinRequest.course.id },
                },
            });
            if (existingEnrollment) {
                // Optionally remove the request to clean up
                await this.joinCourseRequestRepository.remove(joinRequest);
                return { message: "User is already enrolled in the course" };
            }
            // Remove the join request
            await this.joinCourseRequestRepository.remove(joinRequest);
            // Enroll the user in the course
            const userInCourse = new UserInCourse_1.UserInCourse();
            userInCourse.user = joinRequest.user;
            userInCourse.course = joinRequest.course;
            await this.userInCourseRepository.save(userInCourse);
            return { message: "Request approved and user added to the course" };
        }
        if (action === "reject") {
            await this.joinCourseRequestRepository.remove(joinRequest);
            return { message: "Request rejected" };
        }
        throw new Error("Invalid action");
    }
    async getJoinCourseRequestsByUser(userId) {
        const joinRequests = await this.joinCourseRequestRepository.find({
            where: { user: { id: userId } },
            relations: ["course"],
        });
        if (!joinRequests.length) {
            throw new Error("No join requests found for this user");
        }
        return joinRequests;
    }
}
exports.JoinCourseService = JoinCourseService;
exports.default = JoinCourseService; //
