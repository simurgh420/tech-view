import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), userHasPermission: vi.fn(), adminUpdateUser: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { updateAdminUserAction } from './updateAdminUserAction';

describe('updateAdminUserAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects requests without a session', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue(null);

    await expect(updateAdminUserAction('target-id', { name: 'Updated' })).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('وارد شوید'),
    });
    expect(authApi.adminUpdateUser).not.toHaveBeenCalled();
  });

  it('requires update permissions', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: false, error: null });

    await expect(updateAdminUserAction('target-id', { name: 'Updated' })).resolves.toMatchObject({
      success: false,
    });
    expect(authApi.adminUpdateUser).not.toHaveBeenCalled();
  });

  it('updates the target user with the supplied data', async () => {
    const headersList = new Headers();
    const data = { name: 'Updated', email: 'updated@example.com' };
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: true, error: null });
    authApi.adminUpdateUser.mockResolvedValue(undefined);

    await expect(updateAdminUserAction('target-id', data)).resolves.toEqual({
      success: true,
      error: null,
    });
    expect(authApi.adminUpdateUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { userId: 'target-id', data },
    });
  });
});
