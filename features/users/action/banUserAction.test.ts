import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: {
    getSession: vi.fn(),
    userHasPermission: vi.fn(),
    banUser: vi.fn(),
  },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { banUserAction } from './banUserAction';

describe('banUserAction', () => {
  const headersList = new Headers();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(headersList);
  });

  it('rejects users without a session', async () => {
    authApi.getSession.mockResolvedValue(null);

    await expect(banUserAction('target-id', 'reason', null)).resolves.toEqual({
      success: false,
      error: 'Unauthorized: لطفاً وارد شوید',
    });
    expect(authApi.userHasPermission).not.toHaveBeenCalled();
    expect(authApi.banUser).not.toHaveBeenCalled();
  });

  it('prevents a user from banning themselves', async () => {
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });

    await expect(banUserAction('admin-id', 'reason', null)).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('خودتان'),
    });
    expect(authApi.userHasPermission).not.toHaveBeenCalled();
  });

  it('rejects the request when permission is denied', async () => {
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: false, error: null });

    await expect(banUserAction('target-id', 'reason', null)).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('اجازه بن کردن'),
    });
    expect(authApi.banUser).not.toHaveBeenCalled();
  });

  it('bans the target with the provided details when authorized', async () => {
    authApi.getSession.mockResolvedValue({ user: { id: 'admin-id' } });
    authApi.userHasPermission.mockResolvedValue({ success: true, error: null });
    authApi.banUser.mockResolvedValue(undefined);

    await expect(banUserAction('target-id', 'spam', null)).resolves.toEqual({
      success: true,
      error: null,
    });
    expect(authApi.banUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { userId: 'target-id', banReason: 'spam', banExpiresIn: 0 },
    });
  });
});