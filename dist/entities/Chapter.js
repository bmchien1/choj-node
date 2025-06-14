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
exports.Chapter = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Course_1 = require("./Course");
const Lesson_1 = require("./Lesson");
const Assignment_1 = require("./Assignment");
let Chapter = class Chapter extends BaseEntity_1.BaseEntity {
};
exports.Chapter = Chapter;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course),
    (0, typeorm_1.JoinColumn)({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], Chapter.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Chapter.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Chapter.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Chapter.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Lesson_1.Lesson, (lesson) => lesson.chapter),
    __metadata("design:type", Array)
], Chapter.prototype, "lessons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Assignment_1.Assignment, (assignment) => assignment.chapter),
    __metadata("design:type", Array)
], Chapter.prototype, "assignments", void 0);
exports.Chapter = Chapter = __decorate([
    (0, typeorm_1.Entity)()
], Chapter);
