"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserInCourseService_1 = require("../services/UserInCourseService");
const router = (0, express_1.Router)();
const userInCourseService = UserInCourseService_1.UserInCourseService.getInstance();
// Lấy khóa học của user theo userId
router.get("/:userId", async (req, res, next) => {
    try {
        const userInCourses = await userInCourseService.getAllUserInCourseByUserId(parseInt(req.params.userId));
        res.json(userInCourses);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
