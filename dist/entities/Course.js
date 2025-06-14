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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const User_1 = require("./User");
const Assignment_1 = require("./Assignment");
const Lesson_1 = require("./Lesson");
const Chapter_1 = require("./Chapter");
let Course = class Course extends BaseEntity_1.BaseEntity {
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.courses),
    __metadata("design:type", User_1.User)
], Course.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "Toán" }),
    __metadata("design:type", String)
], Course.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Chapter_1.Chapter, (chapter) => chapter.course),
    __metadata("design:type", Array)
], Course.prototype, "chapters", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Assignment_1.Assignment, (assignment) => assignment.course),
    __metadata("design:type", Array)
], Course.prototype, "assignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Lesson_1.Lesson, (lesson) => lesson.course),
    __metadata("design:type", Array)
], Course.prototype, "lessons", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)()
], Course);
