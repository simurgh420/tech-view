import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { signInEmail: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { loginAction } from './login';

describe('loginAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects invalid credentials before calling the auth API', async () => {
    await expect(loginAction({ email: 'bad-email', password: '' })).resolves.toEqual({
      success: false,
      error: 'اطلاعات وارد شده معتبر نیست',
    });
    expect(authApi.signInEmail).not.toHaveBeenCalled();
  });

  it('passes validated credentials and returns the auth response', async () => {
    const headersList = new Headers();
    const response = { user: { id: 'user-id' } };
    mockHeaders.mockResolvedValue(headersList);
    authApi.signInEmail.mockResolvedValue(response);

    await expect(loginAction({ email: 'user@example.com', password: 'secret' })).resolves.toEqual({
      success: true,
      data: response,
    });
    expect(authApi.signInEmail).toHaveBeenCalledWith({
      headers: headersList,
      body: { email: 'user@example.com', password: 'secret' },
    });
  });

  it('returns a safe error when the auth API fails unexpectedly', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.signInEmail.mockRejectedValue(new Error('database unavailable'));

    await expect(loginAction({ email: 'user@example.com', password: 'secret' })).resolves.toEqual({
      success: false,
      error: 'خطای داخلی سرور',
    });
  });
});
