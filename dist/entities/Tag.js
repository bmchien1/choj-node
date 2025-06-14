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
exports.Tag = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const User_1 = require("./User");
const Question_1 = require("./Question");
let Tag = class Tag extends BaseEntity_1.BaseEntity {
};
exports.Tag = Tag;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.tags),
    __metadata("design:type", User_1.User)
], Tag.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Question_1.Question, (question) => question.tags),
    __metadata("design:type", Array)
], Tag.prototype, "questions", void 0);
exports.Tag = Tag = __decorate([
    (0, typeorm_1.Entity)()
], Tag);
