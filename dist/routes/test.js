"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TestService_1 = require("../services/TestService");
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const testService = TestService_1.TestService.getInstance();
// Tạo bài kiểm tra mới (ADMIN, TEACHER)
router.post("/contest", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const test = await testService.createTest(req.body);
        res.status(201).json(test);
    }
    catch (err) {
        next(err);
    }
});
// Lấy tất cả bài kiểm tra
router.get("/contest", async (req, res, next) => {
    try {
        const tests = await testService.getAllTests(req.query);
        res.json(tests);
    }
    catch (err) {
        next(err);
    }
});
// Lấy bài kiểm tra theo ID
router.get("/contest/:id", async (req, res, next) => {
    try {
        const test = await testService.getTestById(parseInt(req.params.id));
        res.json(test);
    }
    catch (err) {
        next(err);
    }
});
// Cập nhật bài kiểm tra (ADMIN, TEACHER)
router.put("/contest/:id", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const test = await testService.updateTest(parseInt(req.params.id), req.body);
        res.json(test);
    }
    catch (err) {
        next(err);
    }
});
// Xóa bài kiểm tra (ADMIN, TEACHER)
router.delete("/contest/:id", (0, isAuthenticated_1.default)([types_1.AppRole.ADMIN, types_1.AppRole.TEACHER]), async (req, res, next) => {
    try {
        const result = await testService.deleteTest(parseInt(req.params.id));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
