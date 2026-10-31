import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockRevalidatePath } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), userHasPermission: vi.fn(), unbanUser: vi.fn() },
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { unbanUserAction } from './unbanUserAction';

describe('unbanUserAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated requests', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue(null);

    await expect(unbanUserAction('target-id')).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('وارد شوید'),
    });
    expect(authApi.userHasPermission).not.toHaveBeenCalled();
  });

  it('prevents a user from unbanning themselves', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });

    await expect(unbanUserAction('admin-id')).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('خودتان'),
    });
    expect(authApi.unbanUser).not.toHaveBeenCalled();
  });

  it('unbans the target when the admin has permission', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: true, error: null });
    authApi.unbanUser.mockResolvedValue(undefined);

    await expect(unbanUserAction('target-id')).resolves.toEqual({ success: true, error: null });
    expect(authApi.unbanUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { userId: 'target-id' },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/admin');
  });
});
