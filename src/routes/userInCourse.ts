import { Router } from "express";
import { UserInCourseService } from "../services/UserInCourseService";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();
const userInCourseService = UserInCourseService.getInstance();

// Lấy khóa học của user theo userId
router.get("/:userId", async (req, res, next) => {
  try {
    const userInCourses = await userInCourseService.getAllUserInCourseByUserId(parseInt(req.params.userId));
    res.json(userInCourses);
  } catch (err) {
    next(err);
  }
});

export default router;