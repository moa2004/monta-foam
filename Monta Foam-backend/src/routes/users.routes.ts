import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  listUsers, getUserById, updateUserRole, toggleSuspend, deleteUser,
  updateRoleSchema, suspendSchema,
} from '../controllers/users.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN));

router.get('/', listUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', authorize(Role.MASTER_ADMIN), validate(updateRoleSchema), updateUserRole);
router.patch('/:id/suspend', validate(suspendSchema), toggleSuspend);
router.delete('/:id', authorize(Role.MASTER_ADMIN), deleteUser);

export default router;
