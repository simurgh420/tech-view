import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockRevalidatePath, mockUploadImage } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), updateUser: vi.fn() },
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockUploadImage: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@/features/upload/server/uploadImage', () => ({ uploadImage: mockUploadImage }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { updateUserAction } from './updateuserAction';

describe('updateUserAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated user', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue(null);

    await expect(updateUserAction(new FormData())).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('وارد شوید'),
    });
    expect(authApi.updateUser).not.toHaveBeenCalled();
  });

  it('rejects names outside the allowed length', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({ user: { id: 'user-id', role: 'USER' } });
    const formData = new FormData();
    formData.set('name', 'A');

    await expect(updateUserAction(formData)).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('بین ۲ تا ۵۰'),
    });
    expect(authApi.updateUser).not.toHaveBeenCalled();
  });

  it('updates profile fields and revalidates settings', async () => {
    const headersList = new Headers();
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'user-id', role: 'USER' } });
    authApi.updateUser.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set('name', 'New Name');
    formData.set('phone', '09123456789');

    await expect(updateUserAction(formData)).resolves.toEqual({
      success: true,
      error: null,
      imageUrl: undefined,
    });
    expect(authApi.updateUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { name: 'New Name', phone: '09123456789' },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/settings');
  });
});
