// features/reports/server/users.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/prisma-adapter/client', () => ({
  default: {
    user: { count: vi.fn() },
  },
}));

import prisma from '@/features/prisma-adapter/client';
import { getUserSummary } from './users';

const user = prisma.user as any;

const current = {
  start: new Date('2025-06-01T00:00:00.000Z'),
  end: new Date('2025-06-30T00:00:00.000Z'),
};
const previous = {
  start: new Date('2025-05-01T00:00:00.000Z'),
  end: new Date('2025-06-01T00:00:00.000Z'),
};

describe('reports/server/users › getUserSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should count users created in the current period (lte)', async () => {
    user.count.mockResolvedValue(0);

    await getUserSummary(current, previous);

    expect(user.count).toHaveBeenNthCalledWith(1, {
      where: { createdAt: { gte: current.start, lte: current.end } },
    });
  });

  it('should count users created in the previous period (lt)', async () => {
    user.count.mockResolvedValue(0);

    await getUserSummary(current, previous);

    expect(user.count).toHaveBeenNthCalledWith(2, {
      where: { createdAt: { gte: previous.start, lt: previous.end } },
    });
  });

  it('should return current and previous counts in the right slots', async () => {
    user.count.mockResolvedValueOnce(25).mockResolvedValueOnce(10);

    expect(await getUserSummary(current, previous)).toEqual({ current: 25, previous: 10 });
  });

  it('should return zeros when there are no users', async () => {
    user.count.mockResolvedValue(0);

    expect(await getUserSummary(current, previous)).toEqual({ current: 0, previous: 0 });
  });

  it('should propagate errors', async () => {
    user.count.mockRejectedValue(new Error('DB error'));

    await expect(getUserSummary(current, previous)).rejects.toThrow('DB error');
  });
});
