import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalUsers,
    totalRequests,
    totalServices,
    newRequestsThisMonth,
    newUsersThisMonth,
    newRequestsLastMonth,
    newUsersLastMonth,
    pendingRequests,
    recentRequests,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.serviceRequest.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
    prisma.serviceRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        service: { select: { title: true } },
      },
    }),
  ]);

  const requestGrowth = newRequestsLastMonth > 0
    ? (((newRequestsThisMonth - newRequestsLastMonth) / newRequestsLastMonth) * 100).toFixed(1)
    : null;
  const userGrowth = newUsersLastMonth > 0
    ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
    : null;

  res.json({
    success: true,
    data: {
      totalUsers,
      totalRequests,
      totalServices,
      pendingRequests,
      newRequestsThisMonth,
      newUsersThisMonth,
      requestGrowth,
      userGrowth,
      recentRequests,
    },
  });
});