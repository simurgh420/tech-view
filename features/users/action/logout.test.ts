import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockRevalidatePath, mockRedirect } = vi.hoisted(() => ({
  authApi: { signOut: vi.fn() },
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { logoutAction } from './logout';

describe('logoutAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('signs out, revalidates the home page, and redirects to login', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.signOut.mockResolvedValue(undefined);

    await logoutAction();

    expect(authApi.signOut).toHaveBeenCalledWith({ headers: headersList });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login');
  });

  it('returns an error when sign out fails', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.signOut.mockRejectedValue(new Error('session unavailable'));

    await expect(logoutAction()).resolves.toEqual({
      success: false,
      error: 'خطای داخلی سرور',
    });
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
