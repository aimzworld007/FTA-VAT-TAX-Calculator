import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from '../server/env';

declare global {
  // Prevent duplicate PrismaClient instances during local hot-reload in development.
  // In serverless runtimes, modules may be re-evaluated across invocations, so this
  // global cache helps avoid exhausting the PostgreSQL connection pool.
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prismaClient =
  globalThis.__prisma__ ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma__ = prismaClient;
}

export { prismaClient as prisma };
