import { Router } from "express";
import TagService from "../services/TagService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const tagService = TagService.getInstance();

// Protected routes requiring authentication
router.post("/", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.get("/", isAuthenticated(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';

    const [tags, total] = await tagService.getAllTagsPaginated(
      skip,
      limit,
      {
        search,
        sortField,
        sortOrder
      }
    );
    res.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get("/creator/:creatorId", isAuthenticated(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as 'ascend' | 'descend';

    const [tags, total] = await tagService.getTagsByCreatorPaginated(
      parseInt(req.params.creatorId),
      skip,
      limit,
      {
        search,
        sortField,
        sortOrder
      }
    );
    res.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", isAuthenticated(), async (req, res, next) => {
  try {
    const tag = await tagService.getTagById(parseInt(req.params.id));
    res.json(tag);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const tag = await tagService.updateTag(parseInt(req.params.id), req.body);
    res.json(tag);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await tagService.deleteTag(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/question/:questionId/tag/:tagId", async (req, res, next) => {
  try {
    const question = await tagService.addTagToQuestion(parseInt(req.params.questionId), parseInt(req.params.tagId));
    res.json(question);
  } catch (err) {
    next(err);
  }
});

export default router;