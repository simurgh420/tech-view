import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { resetPassword: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { resetPasswordAction } from './resetPasswordAction';

describe('resetPasswordAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an invalid password before checking the token', async () => {
    await expect(
      resetPasswordAction({ newPassword: 'weak', token: 'valid-token' })
    ).resolves.toMatchObject({ success: false });
    expect(authApi.resetPassword).not.toHaveBeenCalled();
  });

  it('rejects a missing token', async () => {
    await expect(
      resetPasswordAction({ newPassword: 'Password123', token: '' })
    ).resolves.toMatchObject({
      success: false,
      error: 'لینک بازیابی نامعتبر یا منقضی شده است',
    });
    expect(authApi.resetPassword).not.toHaveBeenCalled();
  });

  it('submits the valid password and reset token', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.resetPassword.mockResolvedValue(undefined);

    await expect(
      resetPasswordAction({ newPassword: 'Password123', token: 'reset-token' })
    ).resolves.toMatchObject({ success: true, error: null });
    expect(authApi.resetPassword).toHaveBeenCalledWith({
      headers: headersList,
      body: { newPassword: 'Password123', token: 'reset-token' },
    });
  });
});
