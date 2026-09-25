import { Router } from 'express';
import {
  getMyNotifications, markAsRead, markAllAsRead, deleteNotification,
} from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
