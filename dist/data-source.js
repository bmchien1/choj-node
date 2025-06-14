"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.initializeDatabase = initializeDatabase;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const Appeal_1 = require("./entities/Appeal");
const Assignment_1 = require("./entities/Assignment");
const AssignmentSubmission_1 = require("./entities/AssignmentSubmission");
const CarouselImage_1 = require("./entities/CarouselImage");
const Course_1 = require("./entities/Course");
const DifficultyLevel_1 = require("./entities/DifficultyLevel");
const Grade_1 = require("./entities/Grade");
const JoinCourseRequest_1 = require("./entities/JoinCourseRequest");
const Lesson_1 = require("./entities/Lesson");
const Live_1 = require("./entities/Live");
const Matrix_1 = require("./entities/Matrix");
const Permission_1 = require("./entities/Permission");
const Question_1 = require("./entities/Question");
const Subject_1 = require("./entities/Subject");
const Submission_1 = require("./entities/Submission");
const Test_1 = require("./entities/Test");
const TestSubmission_1 = require("./entities/TestSubmission");
const User_1 = require("./entities/User");
const UserInCourse_1 = require("./entities/UserInCourse");
const Tag_1 = require("./entities/Tag");
const Chapter_1 = require("./entities/Chapter");
const Contest_1 = require("./entities/Contest");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
    entities: [
        Appeal_1.Appeal,
        Assignment_1.Assignment,
        AssignmentSubmission_1.AssignmentSubmission,
        CarouselImage_1.CarouselImage,
        Course_1.Course,
        DifficultyLevel_1.DifficultyLevel,
        Grade_1.Grade,
        JoinCourseRequest_1.JoinCourseRequest,
        Lesson_1.Lesson,
        Live_1.Live,
        Matrix_1.Matrix,
        Permission_1.Permission,
        Question_1.Question,
        Subject_1.Subject,
        Submission_1.Submission,
        Test_1.Test,
        TestSubmission_1.TestSubmission,
        User_1.User,
        UserInCourse_1.UserInCourse,
        Tag_1.Tag,
        Chapter_1.Chapter,
        Contest_1.Contest
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: [],
});
async function initializeDatabase() {
    try {
        await exports.AppDataSource.initialize();
        console.log("Database connected successfully to Neon Postgres");
    }
    catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
}
