import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../config/logger';

let io: SocketServer;

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new Error('No token');
      const payload = verifyAccessToken(token);
      (socket as Socket & { userId: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    socket.join(`user:${userId}`);
    logger.info(`Socket connected: ${userId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
