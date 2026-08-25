import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let dbUrl = "file:./dev.db";

// On Vercel (or any read-only serverless env), copy the SQLite DB to /tmp so Prisma can create journal files
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    try {
      const originalDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(originalDbPath)) {
        fs.copyFileSync(originalDbPath, tmpDbPath);
        console.log('Successfully copied dev.db to /tmp/dev.db');
      } else {
        console.warn('dev.db not found at', originalDbPath);
      }
    } catch (e) {
      console.error("Failed to copy db to /tmp", e);
    }
  }
  dbUrl = "file:/tmp/dev.db";
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
