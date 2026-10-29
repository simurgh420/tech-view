import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders } = vi.hoisted(() => ({
  authApi: { signUpEmail: vi.fn() },
  mockHeaders: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { registerAction } from './register';

describe('registerAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects values that do not match the registration schema', async () => {
    await expect(registerAction({ email: 'invalid' })).resolves.toEqual({
      success: false,
      error: 'اطلاعات وارد شده معتبر نیست',
    });
    expect(authApi.signUpEmail).not.toHaveBeenCalled();
  });

  it('normalizes and submits valid registration data', async () => {
    const headersList = new Headers();
    const response = { user: { id: 'user-id' } };
    mockHeaders.mockResolvedValue(headersList);
    authApi.signUpEmail.mockResolvedValue(response);

    await expect(
      registerAction({
        name: 'Test User',
        email: 'user@example.com',
        password: 'Secret1',
        phone: '09123456789',
      })
    ).resolves.toEqual({ success: true, data: response });
    expect(authApi.signUpEmail).toHaveBeenCalledWith({
      headers: headersList,
      body: {
        name: 'Test User',
        email: 'user@example.com',
        password: 'Secret1',
        phone: '09123456789',
      },
    });
  });

  it('returns a safe error when registration fails unexpectedly', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.signUpEmail.mockRejectedValue(new Error('database unavailable'));

    await expect(
      registerAction({ name: 'Test', email: 'user@example.com', password: 'Secret1' })
    ).resolves.toEqual({ success: false, error: 'خطای داخلی سرور' });
  });
});
