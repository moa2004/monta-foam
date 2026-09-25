import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  listServices, listServicesAdmin, getService,
  createService, updateService, deleteService, serviceBodySchema, serviceUpdateSchema,
} from '../controllers/services.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public
router.get('/', listServices);
router.get('/:id', getService);

// Admin
router.get('/admin/all', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), listServicesAdmin);
router.post('/', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), validate(serviceBodySchema), createService);
router.patch('/:id', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), validate(serviceUpdateSchema), updateService);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), deleteService);

export default router;
