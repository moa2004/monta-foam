import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Prevent multiple Prisma Client instances during dev hot-reload
export const prisma: PrismaClient =
  global.prismaGlobal ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}
