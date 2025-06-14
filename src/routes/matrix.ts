import { Router } from "express";
import { MatrixService } from "../services/MatrixService";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();
const matrixService = MatrixService.getInstance();

router.post("/:userId", async (req, res, next) => {
  try {
    const matrix = await matrixService.createMatrix(parseInt(req.params.userId), req.body);
    res.status(201).json(matrix);
  } catch (err) {
    next(err);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const matrices = await matrixService.getMatricesByUser(parseInt(req.params.userId));
    res.json(matrices);
  } catch (err) {
    next(err);
  }
});

router.get("/single/:matrixId", async (req, res, next) => {
  try {
    const matrix = await matrixService.getMatrixById(parseInt(req.params.matrixId));
    res.json(matrix);
  } catch (err) {
    next(err);
  }
});

router.put("/:matrixId", async (req, res, next) => {
  try {
    const matrix = await matrixService.updateMatrix(parseInt(req.params.matrixId), req.body);
    res.json(matrix);
  } catch (err) {
    next(err);
  }
});

router.delete("/:matrixId", async (req, res, next) => {
  try {
    const result = await matrixService.deleteMatrix(parseInt(req.params.matrixId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;