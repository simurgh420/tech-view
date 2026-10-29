import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockRevalidatePath } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), userHasPermission: vi.fn(), setRole: vi.fn() },
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { setUserRoleAction } from './setUserRoleAction';

describe('setUserRoleAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('prevents a user from changing their own role', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });

    await expect(setUserRoleAction('admin-id', 'USER')).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('نقش خودتان'),
    });
    expect(authApi.userHasPermission).not.toHaveBeenCalled();
  });

  it('does not set a role when permission is denied', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: false, error: null });

    await expect(setUserRoleAction('target-id', 'ADMIN')).resolves.toMatchObject({
      success: false,
    });
    expect(authApi.setRole).not.toHaveBeenCalled();
  });

  it('sets the requested role and revalidates the admin page', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: true, error: null });
    authApi.setRole.mockResolvedValue(undefined);

    await expect(setUserRoleAction('target-id', 'ADMIN')).resolves.toEqual({
      success: true,
      error: null,
    });
    expect(authApi.setRole).toHaveBeenCalledWith({
      headers: headersList,
      body: { userId: 'target-id', role: 'ADMIN' },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/admin');
  });
});
