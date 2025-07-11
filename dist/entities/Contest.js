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
exports.Contest = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Question_1 = require("./Question");
const BaseEntity_1 = require("./BaseEntity");
let Contest = class Contest extends BaseEntity_1.BaseEntity {
};
exports.Contest = Contest;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contest.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Contest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Contest.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contest.prototype, "accessUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Contest.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Contest.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Contest.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.contests),
    __metadata("design:type", User_1.User)
], Contest.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Question_1.Question, question => question.contest),
    __metadata("design:type", Array)
], Contest.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Contest.prototype, "questions_scores", void 0);
exports.Contest = Contest = __decorate([
    (0, typeorm_1.Entity)()
], Contest);
