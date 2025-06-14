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
exports.UserInCourse = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const Course_1 = require("./Course");
const User_1 = require("./User");
let UserInCourse = class UserInCourse extends BaseEntity_1.BaseEntity {
};
exports.UserInCourse = UserInCourse;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], UserInCourse.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course),
    (0, typeorm_1.JoinColumn)({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], UserInCourse.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { default: () => "'[]'" }),
    __metadata("design:type", Array)
], UserInCourse.prototype, "lessonProgress", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { default: () => "'[]'" }),
    __metadata("design:type", Array)
], UserInCourse.prototype, "assignmentProgress", void 0);
exports.UserInCourse = UserInCourse = __decorate([
    (0, typeorm_1.Entity)()
], UserInCourse);
