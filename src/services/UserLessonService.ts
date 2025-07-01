import { AppDataSource } from "../data-source";
import { UserLesson } from "../entities/UserLesson";
import { User } from "../entities/User";
import { Lesson } from "../entities/Lesson";
import { Repository } from "typeorm";

class UserLessonService {
  private readonly userLessonRepository: Repository<UserLesson>;
  private readonly userRepository: Repository<User>;
  private readonly lessonRepository: Repository<Lesson>;
  private static instance: UserLessonService;

  private constructor() {
    this.userLessonRepository = AppDataSource.getRepository(UserLesson);
    this.userRepository = AppDataSource.getRepository(User);
    this.lessonRepository = AppDataSource.getRepository(Lesson);
  }

  public static getInstance(): UserLessonService {
    if (!UserLessonService.instance) {
      UserLessonService.instance = new UserLessonService();
    }
    return UserLessonService.instance;
  }

  async markCompleted(userId: number, lessonId: number, completed: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!user || !lesson) throw new Error("User or Lesson not found");
    let userLesson = await this.userLessonRepository.findOne({ where: { user: { id: userId }, lesson: { id: lessonId } } });
    if (!userLesson) {
      userLesson = this.userLessonRepository.create({ user, lesson, completed });
    } else {
      userLesson.completed = completed;
    }
    return await this.userLessonRepository.save(userLesson);
  }

  async getCompletedLessons(userId: number): Promise<UserLesson[]> {
    return await this.userLessonRepository.find({ where: { user: { id: userId }, completed: true } });
  }

  async isLessonCompleted(userId: number, lessonId: number): Promise<boolean> {
    const userLesson = await this.userLessonRepository.findOne({ where: { user: { id: userId }, lesson: { id: lessonId } } });
    return !!userLesson?.completed;
  }
}

export default UserLessonService; 