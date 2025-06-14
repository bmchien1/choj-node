import { Router } from "express";
import { UserService } from "../services/UserService";
import isAuthenticated from "../middleware/isAuthenticated";
import { AppRole } from "../types";

const router = Router();
const userService = UserService.getInstance();

// Đăng ký người dùng
router.post("/register", async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// Đăng nhập
router.post("/login", async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Làm mới token
router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await userService.refreshToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Đăng xuất
router.post("/logout", isAuthenticated(), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const result = await userService.logout(user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Đổi mật khẩu
router.post("/change-password", isAuthenticated(), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const updatedUser = await userService.changePassword(user, req.body);
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Lấy thông tin người dùng hiện tại
router.get("/me", isAuthenticated(), async (req, res, next) => {
  try {
    const user = (req as any).user;
    res.json(user.toApiResponse());
  } catch (err) {
    next(err);
  }
});

// Lấy tất cả người dùng (ADMIN)
router.get("/users", isAuthenticated([AppRole.ADMIN]), async (req, res, next) => {
  try {
    const users = await userService.getAll(req.query);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Lấy người dùng theo ID (ADMIN)
router.get("/user/:id", isAuthenticated([AppRole.ADMIN]), async (req, res, next) => {
  try {
    const user = await userService.getOne({ id: parseInt(req.params.id) });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Cập nhật thông tin người dùng (ADMIN)
router.put("/update-user", isAuthenticated([AppRole.ADMIN]), async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const updatedUser = await userService.updateAdmin({ userId, role });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

export default router;