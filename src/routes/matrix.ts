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
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';

    const [matrices, total] = await matrixService.getMatricesByUserPaginated(
      userId,
      (page - 1) * limit,
      limit,
      search,
      sortField,
      sortOrder
    );

    res.json({
      matrices,
      pagination: {
        total,
        page,
        limit
      }
    });
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

// Get all matrices with pagination
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';

    const [matrices, total] = await matrixService.getAllMatricesPaginated(
      (page - 1) * limit,
      limit,
      search,
      sortField,
      sortOrder
    );

    res.json({
      matrices,
      pagination: {
        total,
        page,
        limit
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;