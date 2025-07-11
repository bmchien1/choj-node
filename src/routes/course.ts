import { Router } from "express";
import { CourseService } from "../services/CourseService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const courseService = CourseService.getInstance();

// Protected routes requiring authentication
router.post("/", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json(course);
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
    const classFilter = req.query.class as string;
    const subjectFilter = req.query.subject as string;

    const [courses, total] = await courseService.getAllCoursesPaginated(
      skip,
      limit,
      {
        search,
        sortField,
        sortOrder,
        class: classFilter,
        subject: subjectFilter
      }
    );
    res.json({
      courses,
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
    const course = await courseService.getCourseById(parseInt(req.params.id));
    res.json(course);
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
    const classFilter = req.query.class as string;
    const subjectFilter = req.query.subject as string;

    const [courses, total] = await courseService.getCoursesByCreatorPaginated(
      parseInt(req.params.creatorId),
      skip,
      limit,
      {
        search,
        sortField,
        sortOrder,
        class: classFilter,
        subject: subjectFilter
      }
    );
    res.json({
      courses,
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

router.put("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(parseInt(req.params.id), req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", isAuthenticated([AppRole.TEACHER, AppRole.ADMIN]), async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/content", isAuthenticated(), async (req, res, next) => {
  try {
    const content = await courseService.getCourseContent(parseInt(req.params.id));
    res.json(content);
  } catch (err) {
    next(err);
  }
});

export default router;