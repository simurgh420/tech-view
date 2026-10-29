import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), changePassword: vi.fn(), signOut: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { changePasswordAction } from './changePasswordAction';

describe('changePasswordAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires the current password', async () => {
    const formData = new FormData();
    formData.set('newPassword', 'Password123');

    await expect(changePasswordAction(formData)).resolves.toMatchObject({
      success: false,
      error: 'رمز عبور فعلی را وارد کنید',
    });
    expect(authApi.getSession).not.toHaveBeenCalled();
  });

  it('rejects invalid new passwords', async () => {
    const formData = new FormData();
    formData.set('currentPassword', 'old-password');
    formData.set('newPassword', 'short');

    await expect(changePasswordAction(formData)).resolves.toMatchObject({ success: false });
    expect(authApi.getSession).not.toHaveBeenCalled();
  });

  it('requires an authenticated session', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue(null);
    const formData = new FormData();
    formData.set('currentPassword', 'old-password');
    formData.set('newPassword', 'Password123');

    await expect(changePasswordAction(formData)).resolves.toMatchObject({
      success: false,
      error: 'لطفاً وارد حساب خود شوید',
    });
    expect(authApi.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password and signs out the user', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'user-id' } });
    authApi.changePassword.mockResolvedValue(undefined);
    authApi.signOut.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set('currentPassword', 'old-password');
    formData.set('newPassword', 'Password123');

    await expect(changePasswordAction(formData)).resolves.toEqual({ success: true, error: null });
    expect(authApi.changePassword).toHaveBeenCalledWith({
      headers: headersList,
      body: { currentPassword: 'old-password', newPassword: 'Password123' },
    });
    expect(authApi.signOut).toHaveBeenCalledWith({ headers: headersList });
  });
});
