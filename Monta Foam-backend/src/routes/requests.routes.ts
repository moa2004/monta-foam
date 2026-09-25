import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createServiceRequest, listRequests, getRequest,
  updateRequestStatus, myRequests, createRequestSchema,
} from '../controllers/requests.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public - anyone (guest or logged in) can submit a request
router.post('/', optionalAuthenticate, validate(createRequestSchema), createServiceRequest);

// Authenticated user - view own requests
router.get('/me', authenticate, myRequests);

// Admin
router.get('/', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), listRequests);
router.get('/:id', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), getRequest);
router.patch('/:id/status', authenticate, authorize(Role.ADMIN, Role.MASTER_ADMIN), updateRequestStatus);

export default router;
