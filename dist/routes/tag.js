"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TagService_1 = require("../services/TagService");
const router = (0, express_1.Router)();
const tagService = TagService_1.TagService.getInstance();
router.post("/", async (req, res, next) => {
    try {
        const tag = await tagService.createTag(req.body);
        res.status(201).json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.get("/", async (req, res, next) => {
    try {
        const tags = await tagService.getAllTags();
        res.json(tags);
    }
    catch (err) {
        next(err);
    }
});
router.get("/creator/:creatorId", async (req, res, next) => {
    try {
        const creatorId = parseInt(req.params.creatorId);
        const tags = await tagService.getTagsByCreator(creatorId);
        res.json(tags);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const tag = await tagService.getTagById(parseInt(req.params.id));
        res.json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const tag = await tagService.updateTag(parseInt(req.params.id), req.body);
        res.json(tag);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
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
