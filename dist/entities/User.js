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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const types_1 = require("../types");
const Question_1 = require("./Question");
const Course_1 = require("./Course");
const Tag_1 = require("./Tag");
const Contest_1 = require("./Contest");
let User = class User extends BaseEntity_1.BaseEntity {
    toApiResponse() {
        return {
            id: this.id,
            email: this.email,
            role: this.role,
            avatar_url: this.avatar_url,
        };
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: types_1.AppRole,
        default: types_1.AppRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "access_token", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "refresh_token", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Course_1.Course, (course) => course.creator),
    __metadata("design:type", Array)
], User.prototype, "courses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Contest_1.Contest, (contest) => contest.creator),
    __metadata("design:type", Array)
], User.prototype, "contests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Question_1.Question, (question) => question.creator),
    __metadata("design:type", Array)
], User.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Tag_1.Tag, (tag) => tag.creator),
    __metadata("design:type", Array)
], User.prototype, "tags", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
