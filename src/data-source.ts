import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Appeal } from "./entities/Appeal";
import { Assignment } from "./entities/Assignment";
import { AssignmentSubmission } from "./entities/AssignmentSubmission";
import { CarouselImage } from "./entities/CarouselImage";
import { Course } from "./entities/Course";
import { DifficultyLevel } from "./entities/DifficultyLevel";
import { Grade } from "./entities/Grade";
import { JoinCourseRequest } from "./entities/JoinCourseRequest";
import { Lesson } from "./entities/Lesson";
import { Live } from "./entities/Live";
import { Matrix } from "./entities/Matrix";
import { Permission } from "./entities/Permission";
import { Question } from "./entities/Question";
import { Subject } from "./entities/Subject";
import { Submission } from "./entities/Submission";
import { Test } from "./entities/Test";
import { TestSubmission } from "./entities/TestSubmission";
import { User } from "./entities/User";
import { UserInCourse } from "./entities/UserInCourse";
import { Tag } from "./entities/Tag";
import { Chapter } from "./entities/Chapter";
import { Contest } from "./entities/Contest";


dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: [
    Appeal,
    Assignment,
    AssignmentSubmission,
    CarouselImage,
    Course,
    DifficultyLevel,
    Grade,
    JoinCourseRequest,
    Lesson,
    Live,
    Matrix,
    Permission,
    Question,
    Subject,
    Submission,
    Test,
    TestSubmission,
    User,
    UserInCourse,
    Tag,
    Chapter,
    Contest
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully to Neon Postgres");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}