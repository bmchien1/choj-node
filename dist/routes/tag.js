"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TagService_1 = __importDefault(require("../services/TagService"));
const isAuthenticated_1 = __importDefault(require("../middleware/isAuthenticated"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
const tagService = TagService_1.default.getInstance();
// Protected routes requiring authentication
router.post("/", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const tag = await tagService.createTag(req.body);
        res.status(201).json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.get("/", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const sortField = req.query.sortField;
        const sortOrder = req.query.sortOrder;
        const [tags, total] = await tagService.getAllTagsPaginated(skip, limit, {
            search,
            sortField,
            sortOrder
        });
        res.json({
            tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/creator/:creatorId", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const sortField = req.query.sortField;
        const sortOrder = req.query.sortOrder;
        const [tags, total] = await tagService.getTagsByCreatorPaginated(parseInt(req.params.creatorId), skip, limit, {
            search,
            sortField,
            sortOrder
        });
        res.json({
            tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", (0, isAuthenticated_1.default)(), async (req, res, next) => {
    try {
        const tag = await tagService.getTagById(parseInt(req.params.id));
        res.json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const tag = await tagService.updateTag(parseInt(req.params.id), req.body);
        res.json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", (0, isAuthenticated_1.default)([types_1.AppRole.TEACHER, types_1.AppRole.ADMIN]), async (req, res, next) => {
    try {
        const result = await tagService.deleteTag(parseInt(req.params.id));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/question/:questionId/tag/:tagId", async (req, res, next) => {
    try {
        const question = await tagService.addTagToQuestion(parseInt(req.params.questionId), parseInt(req.params.tagId));
        res.json(question);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
