import { Router } from 'express';
import { Role } from '@prisma/client';
import { getDashboardStats } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), getDashboardStats);

export default router;
