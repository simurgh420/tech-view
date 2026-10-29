import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockRevalidatePath } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), userHasPermission: vi.fn(), removeUser: vi.fn() },
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { deleteUserAction } from './deleteUserAction';

describe('deleteUserAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an empty user id without reading the session', async () => {
    await expect(deleteUserAction('')).resolves.toMatchObject({
      success: false,
      error: 'شناسه کاربر معتبر نیست',
    });
    expect(authApi.getSession).not.toHaveBeenCalled();
  });

  it('prevents deleting the current user', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });

    await expect(deleteUserAction('admin-id')).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('خودتان'),
    });
    expect(authApi.userHasPermission).not.toHaveBeenCalled();
  });

  it('does not delete a user when permission is denied', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: false, error: null });

    await expect(deleteUserAction('target-id')).resolves.toMatchObject({ success: false });
    expect(authApi.removeUser).not.toHaveBeenCalled();
  });

  it('deletes the authorized target and revalidates the admin page', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: true, error: null });
    authApi.removeUser.mockResolvedValue(undefined);

    await expect(deleteUserAction('target-id')).resolves.toEqual({ success: true, error: null });
    expect(authApi.removeUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { userId: 'target-id' },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/admin');
  });
});
