"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsRoutes = exports.userLessonRoutes = exports.contestRoutes = exports.chapterRoutes = exports.tagRoutes = exports.matrixRoutes = exports.questionRoutes = exports.userInCourseRoutes = exports.submissionRoutes = exports.joinRoutes = exports.assignmentRoutes = exports.lessonRoutes = exports.courseRoutes = exports.authRoutes = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_1).default; } });
var course_1 = require("./course");
Object.defineProperty(exports, "courseRoutes", { enumerable: true, get: function () { return __importDefault(course_1).default; } });
var lesson_1 = require("./lesson");
Object.defineProperty(exports, "lessonRoutes", { enumerable: true, get: function () { return __importDefault(lesson_1).default; } });
var assignment_1 = require("./assignment");
Object.defineProperty(exports, "assignmentRoutes", { enumerable: true, get: function () { return __importDefault(assignment_1).default; } });
var join_1 = require("./join");
Object.defineProperty(exports, "joinRoutes", { enumerable: true, get: function () { return __importDefault(join_1).default; } });
var submission_1 = require("./submission");
Object.defineProperty(exports, "submissionRoutes", { enumerable: true, get: function () { return __importDefault(submission_1).default; } });
var userInCourse_1 = require("./userInCourse");
Object.defineProperty(exports, "userInCourseRoutes", { enumerable: true, get: function () { return __importDefault(userInCourse_1).default; } });
var question_1 = require("./question");
Object.defineProperty(exports, "questionRoutes", { enumerable: true, get: function () { return __importDefault(question_1).default; } });
var matrix_1 = require("./matrix");
Object.defineProperty(exports, "matrixRoutes", { enumerable: true, get: function () { return __importDefault(matrix_1).default; } });
var tag_1 = require("./tag");
Object.defineProperty(exports, "tagRoutes", { enumerable: true, get: function () { return __importDefault(tag_1).default; } });
var chapter_1 = require("./chapter");
Object.defineProperty(exports, "chapterRoutes", { enumerable: true, get: function () { return __importDefault(chapter_1).default; } });
var contest_1 = require("./contest");
Object.defineProperty(exports, "contestRoutes", { enumerable: true, get: function () { return __importDefault(contest_1).default; } });
var userLesson_1 = require("./userLesson");
Object.defineProperty(exports, "userLessonRoutes", { enumerable: true, get: function () { return __importDefault(userLesson_1).default; } });
var statistics_1 = require("./statistics");
Object.defineProperty(exports, "statisticsRoutes", { enumerable: true, get: function () { return __importDefault(statistics_1).default; } });
