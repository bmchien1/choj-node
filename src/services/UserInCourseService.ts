import { Repository } from "typeorm";
import { UserInCourse } from "../entities/UserInCourse";
import { AppDataSource } from "../data-source";

export class UserInCourseService {
  private readonly userInCourseRepository: Repository<UserInCourse>;
  private static instance: UserInCourseService;

  constructor() {
    this.userInCourseRepository = AppDataSource.getRepository(UserInCourse);
  }

  public static getInstance() {
    if (!UserInCourseService.instance) {
      UserInCourseService.instance = new UserInCourseService();
    }
    return UserInCourseService.instance;
  }

  public async getAllUserInCourseByUserId(userId: number) {
    const userInCourses = await this.userInCourseRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "course"],
    });

    if (!userInCourses.length) {
      throw new Error("No courses found for this user");
    }

    return userInCourses;//
  }
}