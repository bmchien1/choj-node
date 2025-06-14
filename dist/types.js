"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionStatus = exports.ProblemDifficulty = exports.ContestStatus = exports.AppRole = void 0;
var AppRole;
(function (AppRole) {
    AppRole["USER"] = "user";
    AppRole["TEACHER"] = "teacher";
    AppRole["ADMIN"] = "admin";
})(AppRole || (exports.AppRole = AppRole = {}));
var ContestStatus;
(function (ContestStatus) {
    ContestStatus["RUNNING"] = "running";
    ContestStatus["COMPLETED"] = "completed";
})(ContestStatus || (exports.ContestStatus = ContestStatus = {}));
var ProblemDifficulty;
(function (ProblemDifficulty) {
    ProblemDifficulty["EASY"] = "easy";
    ProblemDifficulty["MEDIUM"] = "medium";
    ProblemDifficulty["HARD"] = "hard";
})(ProblemDifficulty || (exports.ProblemDifficulty = ProblemDifficulty = {}));
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["ACCEPTED"] = "accepted";
    SubmissionStatus["COMPILATION_ERROR"] = "compilation_error";
    SubmissionStatus["REJECTED"] = "rejected";
    SubmissionStatus["ERROR"] = "error";
    SubmissionStatus["PENDING"] = "pending";
    SubmissionStatus["PARTIAL"] = "partial";
    SubmissionStatus["FAILED"] = "failed";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
