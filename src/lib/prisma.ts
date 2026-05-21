import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set to initialize Prisma Client.');
  }

  return databaseUrl;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

function createPool(): Pool {
  return new Pool({
    connectionString: getDatabaseUrl(),
  });
}

function getPool(): Pool {
  if (process.env.NODE_ENV === 'production') {
    return createPool();
  }

  globalForPrisma.prismaPool ??= createPool();
  return globalForPrisma.prismaPool;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(getPool());

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
