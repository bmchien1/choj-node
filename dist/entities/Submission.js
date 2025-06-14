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
exports.Submission = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Assignment_1 = require("./Assignment");
const User_1 = require("./User");
const Contest_1 = require("./Contest");
const Course_1 = require("./Course");
let Submission = class Submission extends BaseEntity_1.BaseEntity {
};
exports.Submission = Submission;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Assignment_1.Assignment),
    (0, typeorm_1.JoinColumn)({ name: "assignment_id" }),
    __metadata("design:type", Assignment_1.Assignment)
], Submission.prototype, "assignment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Contest_1.Contest),
    (0, typeorm_1.JoinColumn)({ name: "contest_id" }),
    __metadata("design:type", Contest_1.Contest)
], Submission.prototype, "contest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course),
    (0, typeorm_1.JoinColumn)({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], Submission.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], Submission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], Submission.prototype, "answers", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Submission.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Submission.prototype, "submitted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Submission.prototype, "results", void 0);
exports.Submission = Submission = __decorate([
    (0, typeorm_1.Entity)()
], Submission);
