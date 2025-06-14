import { Router } from "express";
import { JoinCourseService } from "../services/JoinCourseService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const joinCourseService = JoinCourseService.getInstance();

// Tạo yêu cầu tham gia khóa học
router.post("/", async (req, res, next) => {
  try {
    const { userId, courseId } = req.body;
    const joinRequest = await joinCourseService.createJoinRequest(userId, courseId);
    res.status(201).json({ message: "Join course request submitted successfully", joinRequest });
  } catch (err) {
    next(err);
  }
});

// Lấy yêu cầu tham gia theo creator ID
router.get("/:creatorId", async (req, res, next) => {
  try {
    const requests = await joinCourseService.getJoinCourseRequestsByCreator(parseInt(req.params.creatorId));
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// Duyệt/từ chối yêu cầu tham gia (ADMIN, TEACHER)
router.put("/:requestId", async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!action || !["approve", "reject"].includes(action)) throw new Error("Action must be either 'approve' or 'reject'");
    const result = await joinCourseService.approveOrRejectRequest(parseInt(req.params.requestId), action);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Lấy yêu cầu tham gia theo user ID
router.get("/user/:userId", async (req, res, next) => {
  try {
    const requests = await joinCourseService.getJoinCourseRequestsByUser(parseInt(req.params.userId));
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// Lấy tất cả yêu cầu tham gia (ADMIN, TEACHER)
router.get("/",  async (req, res, next) => {
  try {
    const requests = await joinCourseService.getAllJoinRequests();
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

export default router;