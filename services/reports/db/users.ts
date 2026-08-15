import prisma from '@/services/db/client';

type UsersPeriod = {
  start: Date;
  end: Date;
};

export async function getUserSummary(current: UsersPeriod, previous: UsersPeriod) {
  const [currentUsers, previousUsers] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: current.start,
          lte: current.end,
        },
      },
    }),

    prisma.user.count({
      where: {
        createdAt: {
          gte: previous.start,
          lt: previous.end,
        },
      },
    }),
  ]);

  return {
    current: currentUsers,
    previous: previousUsers,
  };
}
