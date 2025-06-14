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
exports.Question = void 0;
const typeorm_1 = require("typeorm");
const Assignment_1 = require("./Assignment");
const Test_1 = require("./Test");
const BaseEntity_1 = require("./BaseEntity");
const User_1 = require("./User");
const Tag_1 = require("./Tag");
const Contest_1 = require("./Contest");
let Question = class Question extends BaseEntity_1.BaseEntity {
};
exports.Question = Question;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "questionName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "questionType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Question.prototype, "difficulty_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "question_image_url", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.questions),
    __metadata("design:type", User_1.User)
], Question.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Test_1.Test, (test) => test.questions),
    __metadata("design:type", Test_1.Test)
], Question.prototype, "tests", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Assignment_1.Assignment, (assignment) => assignment.questions),
    __metadata("design:type", Assignment_1.Assignment)
], Question.prototype, "assignments", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Tag_1.Tag, (tag) => tag.questions),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Question.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "templateCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Question.prototype, "cpuTimeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Question.prototype, "memoryLimit", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Array)
], Question.prototype, "testCases", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "correctAnswer", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "choices", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Question.prototype, "maxPoint", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Contest_1.Contest, contest => contest.questions),
    __metadata("design:type", Contest_1.Contest)
], Question.prototype, "contest", void 0);
exports.Question = Question = __decorate([
    (0, typeorm_1.Entity)()
], Question);
