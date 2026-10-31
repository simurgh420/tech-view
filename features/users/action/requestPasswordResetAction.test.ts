import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { requestPasswordReset: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { requestPasswordResetAction } from './requestPasswordResetAction';

describe('requestPasswordResetAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an invalid email without calling the auth API', async () => {
    await expect(
      requestPasswordResetAction({ email: 'invalid', redirectTo: '/reset' })
    ).resolves.toMatchObject({ success: false });
    expect(authApi.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('normalizes the email and sends the requested redirect URL', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.requestPasswordReset.mockResolvedValue(undefined);

    await expect(
      requestPasswordResetAction({ email: ' User@Example.com ', redirectTo: '/reset' })
    ).resolves.toMatchObject({ success: true });
    expect(authApi.requestPasswordReset).toHaveBeenCalledWith({
      headers: headersList,
      body: { email: 'user@example.com', redirectTo: '/reset' },
    });
  });

  it('returns a safe error when the reset request fails unexpectedly', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.requestPasswordReset.mockRejectedValue(new Error('mail unavailable'));

    await expect(
      requestPasswordResetAction({ email: 'user@example.com', redirectTo: '/reset' })
    ).resolves.toMatchObject({ success: false, error: expect.stringContaining('مشکلی') });
  });
});
