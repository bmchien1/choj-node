"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = exports.LessonType = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Course_1 = require("./Course");
const Chapter_1 = require("./Chapter");
var LessonType;
(function (LessonType) {
    LessonType["JSON"] = "json";
    LessonType["VIDEO"] = "video";
})(LessonType || (exports.LessonType = LessonType = {}));
let Lesson = class Lesson extends BaseEntity_1.BaseEntity {
};
exports.Lesson = Lesson;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course),
    (0, typeorm_1.JoinColumn)({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], Lesson.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Chapter_1.Chapter, (chapter) => chapter.lessons, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "chapter_id" }),
    __metadata("design:type", Chapter_1.Chapter)
], Lesson.prototype, "chapter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Lesson.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Lesson.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lesson.prototype, "file_url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Lesson.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Lesson.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: LessonType.JSON }),
    __metadata("design:type", String)
], Lesson.prototype, "lessonType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lesson.prototype, "video_url", void 0);
exports.Lesson = Lesson = __decorate([
    (0, typeorm_1.Entity)()
], Lesson);
