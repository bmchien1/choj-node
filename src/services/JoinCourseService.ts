import { Repository } from "typeorm";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { JoinCourseRequest } from "../entities/JoinCourseRequest";
import { UserInCourse } from "../entities/UserInCourse";

export class JoinCourseService {
  private readonly courseRepository: Repository<Course>;
  private readonly joinCourseRequestRepository: Repository<JoinCourseRequest>;
  private readonly userInCourseRepository: Repository<UserInCourse>;
  private readonly userRepository: Repository<User>;
  private static instance: JoinCourseService;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    this.joinCourseRequestRepository = AppDataSource.getRepository(JoinCourseRequest);
    this.userInCourseRepository = AppDataSource.getRepository(UserInCourse);
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance() {
    if (!JoinCourseService.instance) {
      JoinCourseService.instance = new JoinCourseService();
    }
    return JoinCourseService.instance;
  }

  public async createJoinRequest(userId: number, courseId: number) {
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

    const joinRequest = new JoinCourseRequest();
    joinRequest.user = user;
    joinRequest.course = course;

    return await this.joinCourseRequestRepository.save(joinRequest);
  }

  public async getJoinCourseRequestsByCreator(userId: number) {
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

  public async getAllJoinRequests() {
    const joinRequests = await this.joinCourseRequestRepository.find({
      relations: ["user", "course"],
    });

    if (!joinRequests.length) {
      throw new Error("No join requests found");
    }

    return joinRequests;
  }

  public async approveOrRejectRequest(requestId: number, action: "approve" | "reject") {
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
      const userInCourse = new UserInCourse();
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

  public async getJoinCourseRequestsByUser(userId: number) {
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

export default JoinCourseService;//