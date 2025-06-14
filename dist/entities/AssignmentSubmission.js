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
exports.AssignmentSubmission = void 0;
const typeorm_1 = require("typeorm");
const BaseEntity_1 = require("./BaseEntity");
const User_1 = require("./User");
const Assignment_1 = require("./Assignment");
let AssignmentSubmission = class AssignmentSubmission extends BaseEntity_1.BaseEntity {
};
exports.AssignmentSubmission = AssignmentSubmission;
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], AssignmentSubmission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Assignment_1.Assignment),
    (0, typeorm_1.JoinColumn)({ name: "assignment_id" }),
    __metadata("design:type", Assignment_1.Assignment)
], AssignmentSubmission.prototype, "assignment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], AssignmentSubmission.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double precision" }),
    __metadata("design:type", Number)
], AssignmentSubmission.prototype, "points", void 0);
exports.AssignmentSubmission = AssignmentSubmission = __decorate([
    (0, typeorm_1.Entity)()
], AssignmentSubmission);
