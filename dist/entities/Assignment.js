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
exports.Assignment = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Course_1 = require("./Course");
const Question_1 = require("./Question");
const Chapter_1 = require("./Chapter");
let Assignment = class Assignment extends BaseEntity_1.BaseEntity {
};
exports.Assignment = Assignment;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course),
    (0, typeorm_1.JoinColumn)({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], Assignment.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Chapter_1.Chapter, (chapter) => chapter.assignments, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "chapter_id" }),
    __metadata("design:type", Chapter_1.Chapter)
], Assignment.prototype, "chapter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Assignment.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Assignment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Assignment.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Question_1.Question, (question) => question.assignments),
    __metadata("design:type", Array)
], Assignment.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Assignment.prototype, "questions_scores", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Assignment.prototype, "total_points", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Assignment.prototype, "order", void 0);
exports.Assignment = Assignment = __decorate([
    (0, typeorm_1.Entity)()
], Assignment);
