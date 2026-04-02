import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../controllers/notification.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
