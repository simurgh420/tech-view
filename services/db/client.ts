import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Extension برای تبدیل و تنظیم فیلدهای BetterAuth

const prisma = basePrisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        // تبدیل emailVerified از Boolean به DateTime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (args.data && typeof (args.data as any).emailVerified === 'boolean') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args.data as any).emailVerified =
            (args.data as any).emailVerified === true ? new Date() : null;
        }
        return query(args);
      },
      async update({ args, query }) {
        // تبدیل emailVerified از Boolean به DateTime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (args.data && typeof (args.data as any).emailVerified === 'boolean') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args.data as any).emailVerified =
            (args.data as any).emailVerified === true ? new Date() : null;
        }
        return query(args);
      },
    },
    account: {
      async create({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = args.data as any;

        // حذف فیلدهای اضافی که در schema وجود ندارند
        if (data?.accountId) {
          delete data.accountId;
        }

        // تنظیم provider از providerId
        if (data?.providerId) {
          // همیشه provider را از providerId بگیر (حتی اگر provider وجود داشته باشد)
          data.provider = data.providerId;
          // حذف providerId چون در schema وجود ندارد
          delete data.providerId;
        }

        // اگر providerAccountId وجود ندارد، از userId استفاده کن (برای credential provider)
        if (!data?.providerAccountId && data?.userId) {
          data.providerAccountId = data.userId;
        }

        // اگر type وجود ندارد، مقدار پیش‌فرض بگذار
        if (!data?.type) {
          data.type = data?.provider === 'credential' ? 'credential' : 'oauth';
        }

        // اطمینان از اینکه provider همیشه 'credential' است برای credential provider
        if (data?.provider === 'credential' || data?.type === 'credential') {
          data.provider = 'credential';
          data.type = 'credential';
        }

        return query(args);
      },
      async update({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = args.data as any;

        // حذف فیلدهای اضافی که در schema وجود ندارند
        if (data?.accountId) {
          delete data.accountId;
        }
        if (data?.providerId) {
          // اگر provider وجود ندارد، provider را از providerId بگیر
          if (!data.provider) {
            data.provider = data.providerId;
          }
          // حذف providerId چون در schema وجود ندارد
          delete data.providerId;
        }

        // اگر providerAccountId وجود ندارد، از userId استفاده کن
        if (!data?.providerAccountId && data?.userId) {
          data.providerAccountId = data.userId;
        }

        // اگر type وجود ندارد، مقدار پیش‌فرض بگذار
        if (!data?.type) {
          data.type = data?.provider === 'credential' ? 'credential' : 'oauth';
        }

        return query(args);
      },
      async findFirst({ args, query }) {
        // BetterAuth ممکن است از findFirst برای پیدا کردن Account استفاده کند
        // اگر where شامل providerId است، آن را به provider تبدیل کن

        if (args?.where && typeof args.where === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where = args.where as any;
          if (where.providerId && !where.provider) {
            where.provider = where.providerId;
            delete where.providerId;
          }
        }
        return query(args);
      },
      async findUnique({ args, query }) {
        // BetterAuth ممکن است از findUnique برای پیدا کردن Account استفاده کند
        // اگر where شامل providerId است، آن را به provider تبدیل کن

        if (args?.where && typeof args.where === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where = args.where as any;
          if (where.providerId && !where.provider) {
            where.provider = where.providerId;
            delete where.providerId;
          }
        }
        return query(args);
      },
    },
    session: {
      async create({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = args.data as any;

        // اگر token وجود دارد اما sessionToken وجود ندارد، sessionToken را از token بگیر
        if (data?.token && !data?.sessionToken) {
          data.sessionToken = data.token;
        }

        return query(args);
      },
      async update({ args, query }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = args.data as any;

        // اگر token وجود دارد اما sessionToken وجود ندارد، sessionToken را از token بگیر
        if (data?.token && !data?.sessionToken) {
          data.sessionToken = data.token;
        }

        return query(args);
      },
    },
  },
}) as typeof basePrisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as PrismaClient;

export default prisma;
