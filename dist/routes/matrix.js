"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MatrixService_1 = require("../services/MatrixService");
const router = (0, express_1.Router)();
const matrixService = MatrixService_1.MatrixService.getInstance();
router.post("/:userId", async (req, res, next) => {
    try {
        const matrix = await matrixService.createMatrix(parseInt(req.params.userId), req.body);
        res.status(201).json(matrix);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:userId", async (req, res, next) => {
    try {
        const matrices = await matrixService.getMatricesByUser(parseInt(req.params.userId));
        res.json(matrices);
    }
    catch (err) {
        next(err);
    }
});
router.get("/single/:matrixId", async (req, res, next) => {
    try {
        const matrix = await matrixService.getMatrixById(parseInt(req.params.matrixId));
        res.json(matrix);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:matrixId", async (req, res, next) => {
    try {
        const matrix = await matrixService.updateMatrix(parseInt(req.params.matrixId), req.body);
        res.json(matrix);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:matrixId", async (req, res, next) => {
    try {
        const result = await matrixService.deleteMatrix(parseInt(req.params.matrixId));
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
