import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: req.user!.id } }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  res.json({ success: true, data: notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) throw AppError.notFound('Notification not found', 'NOT_FOUND');
  if (notification.userId !== req.user!.id) throw AppError.forbidden('Access denied', 'FORBIDDEN');

  await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json({ success: true, message: 'Marked as read.' });
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) throw AppError.notFound('Notification not found', 'NOT_FOUND');
  if (notification.userId !== req.user!.id) throw AppError.forbidden('Access denied', 'FORBIDDEN');

  await prisma.notification.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Notification deleted.' });
});
