import { Repository, Like, FindOptionsWhere } from "typeorm";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { Chapter } from "../entities/Chapter";

interface CourseData {
  name: string;
  description: string;
  class: string;
  subject: string;
  creatorId: number;
}

interface CourseQueryOptions {
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  class?: string;
  subject?: string;
}

class CourseService {
  private readonly courseRepository: Repository<Course>;
  private readonly userRepository: Repository<User>;
  private readonly chapterRepository: Repository<Chapter>;

  private static instance: CourseService;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    this.userRepository = AppDataSource.getRepository(User);
    this.chapterRepository = AppDataSource.getRepository(Chapter);
  }
//
  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async createCourse(body: CourseData): Promise<Course> {
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

  async getAllCoursesPaginated(skip: number, take: number, options?: CourseQueryOptions): Promise<[Course[], number]> {
    const where: FindOptionsWhere<Course> = {};

    if (options?.search) {
      where.name = Like(`%${options.search}%`);
    }

    if (options?.class) {
      where.class = options.class;
    }

    if (options?.subject) {
      where.subject = options.subject;
    }

    const order: any = {};
    if (options?.sortField) {
      order[options.sortField] = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
    } else {
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

  async getCoursesByCreatorPaginated(creatorId: number, skip: number, take: number, options?: CourseQueryOptions): Promise<[Course[], number]> {
    const where: FindOptionsWhere<Course> = {
      creator: { id: creatorId }
    };

    if (options?.search) {
      where.name = Like(`%${options.search}%`);
    }

    if (options?.class) {
      where.class = options.class;
    }

    if (options?.subject) {
      where.subject = options.subject;
    }

    const order: any = {};
    if (options?.sortField) {
      order[options.sortField] = options.sortOrder === 'descend' ? 'DESC' : 'ASC';
    } else {
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

  async getAllCourses(): Promise<Course[]> {
    return await this.courseRepository.find({ relations: ["creator"] });
  }

  async getCourseById(id: number): Promise<Course> {
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

  async getCourseByCreator(creatorId: number): Promise<Course[]> {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    const courses = await this.courseRepository.find({
      where: { creator: { id: creatorId } },
      relations: ["creator"],
    });

    return courses;
  }

  async updateCourse(id: number, body: Partial<CourseData>): Promise<Course> {
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

  async deleteCourse(id: number): Promise<{ message: string }> {
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

  async getCourseContent(courseId: number): Promise<Array<{ type: string; id: number; title: string; order: number }>> {
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

export { CourseService };