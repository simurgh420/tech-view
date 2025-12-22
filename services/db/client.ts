import { PrismaClient } from '@/app/generated/prisma/client';
import mockPrisma from '@/prisma/mock';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: PrismaClient | any;
};

function createRealPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}
const prisma =
  process.env.NEXT_BUILD === 'true' ? mockPrisma : globalForPrisma.prisma || createRealPrisma();
if (process.env.NODE_ENV !== 'production' && process.env.NEXT_BUILD !== 'true') {
  globalForPrisma.prisma = prisma;
}
export default prisma;
