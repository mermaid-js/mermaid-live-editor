import { PrismaClient } from '@prisma/client';
import { isProd } from './env';

// Reuse a single PrismaClient across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['warn', 'error'] : ['query', 'warn', 'error']
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}
