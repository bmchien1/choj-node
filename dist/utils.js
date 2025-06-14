"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64Decode = base64Decode;
exports.getSubmissionStatus = getSubmissionStatus;
exports.toPageDTO = toPageDTO;
const types_1 = require("./types");
function base64Decode(str) {
    return Buffer.from(str, "base64").toString("ascii");
}
function getSubmissionStatus(statusId) {
    switch (statusId) {
        case 3:
            return types_1.SubmissionStatus.ACCEPTED;
        case 4:
            return types_1.SubmissionStatus.REJECTED;
        case 6:
            return types_1.SubmissionStatus.ERROR;
        default:
            return types_1.SubmissionStatus.PENDING;
    }
}
function toPageDTO([data, total], page, limit) {
    return {
        contents: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
