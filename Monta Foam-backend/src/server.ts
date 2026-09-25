import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';
import { initSocket } from './sockets/socket';

const bootstrap = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.io for real-time notifications
  initSocket(server);

  // Verify database connectivity before accepting traffic
  await prisma.$connect();
  logger.info('✅ Database connected');

  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running on ${env.API_URL} [${env.NODE_ENV}]`);
    logger.info(`📚 Swagger docs available at ${env.API_URL}/api-docs`);
  });

  // ─── Graceful shutdown ──────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed. Process terminated.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
};

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
