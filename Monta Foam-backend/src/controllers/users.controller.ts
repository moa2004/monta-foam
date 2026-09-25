import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { recordAuditLog, AuditActions } from '../services/auditLog.service';

// ─── validators ─────────────────────────────────────────────────────────────

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const suspendSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/** No one can modify MASTER_ADMIN */
const guardMasterAdmin = (targetRole: Role) => {
  if (targetRole === Role.MASTER_ADMIN) {
    throw AppError.forbidden('MASTER_ADMIN cannot be modified', 'CANNOT_MODIFY_MASTER_ADMIN');
  }
};

// ─── controllers ─────────────────────────────────────────────────────────────

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const role = typeof req.query.role === 'string' && Object.values(Role).includes(req.query.role as Role)
    ? (req.query.role as Role)
    : undefined;

  const where = {
    ...(search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
    ...(role ? { role } : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { id: true, fullName: true, email: true, role: true, isVerified: true, isSuspended: true, provider: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, fullName: true, email: true, role: true, isVerified: true, isSuspended: true, avatar: true, provider: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  res.json({ success: true, data: user });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role: Role };
  const actorRole = req.user!.role;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, fullName: true } });
  if (!target) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  guardMasterAdmin(target.role);
  if (role === Role.MASTER_ADMIN) throw AppError.forbidden('Cannot assign MASTER_ADMIN role', 'CANNOT_ASSIGN_MASTER_ADMIN');
  if (actorRole !== Role.MASTER_ADMIN && role === Role.ADMIN) {
    throw AppError.forbidden('Only MASTER_ADMIN can assign ADMIN role', 'FORBIDDEN');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, fullName: true, email: true, role: true },
  });

  await recordAuditLog({
    action: AuditActions.ROLE_CHANGED,
    actorId: req.user!.id,
    metadata: { targetId: id, from: target.role, to: role },
    req,
  });

  res.json({ success: true, message: 'Role updated.', data: updated });
});

export const toggleSuspend = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) throw AppError.badRequest('Cannot suspend your own account', 'SELF_SUSPEND');

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isSuspended: true } });
  if (!target) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  guardMasterAdmin(target.role);

  const updated = await prisma.user.update({
    where: { id },
    data: { isSuspended: !target.isSuspended },
    select: { id: true, isSuspended: true },
  });

  await recordAuditLog({
    action: updated.isSuspended ? AuditActions.USER_SUSPENDED : AuditActions.USER_UNSUSPENDED,
    actorId: req.user!.id,
    metadata: { targetId: id },
    req,
  });

  res.json({ success: true, message: `User ${updated.isSuspended ? 'suspended' : 'unsuspended'}.`, data: updated });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) throw AppError.badRequest('Cannot delete your own account', 'SELF_DELETE');

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  guardMasterAdmin(target.role);

  await prisma.user.delete({ where: { id } });

  res.json({ success: true, message: 'User deleted.' });
});
