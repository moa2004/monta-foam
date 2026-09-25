import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import servicesRoutes from './services.routes';
import requestsRoutes from './requests.routes';
import notificationsRoutes from './notifications.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/services', servicesRoutes);
router.use('/requests', requestsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

export default router;
