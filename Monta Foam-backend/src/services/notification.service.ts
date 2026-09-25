import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getIO } from '../sockets/socket';
import { logger } from '../config/logger';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a notification record and emits it in real-time to the
 * target user's socket room (if connected).
 */
export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      metadata: input.metadata ? (input.metadata as never) : undefined,
    },
  });

  try {
    const io = getIO();
    io.to(`user:${input.userId}`).emit('notification:new', notification);
  } catch (err) {
    logger.warn('Socket.io not available - skipping real-time emit', {
      error: (err as Error).message,
    });
  }

  return notification;
};

/**
 * Notifies all admin-level users (ADMIN + MASTER_ADMIN) of a system event,
 * e.g. a new service request or new user registration.
 */
export const notifyAdmins = async (input: Omit<CreateNotificationInput, 'userId'>) => {
  const admins = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.MASTER_ADMIN] } },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        ...input,
        userId: admin.id,
      }),
    ),
  );
};
