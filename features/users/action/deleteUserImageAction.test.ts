import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authApi, mockHeaders, mockDeleteImage } = vi.hoisted(() => ({
  authApi: { getSession: vi.fn(), updateUser: vi.fn() },
  mockHeaders: vi.fn(),
  mockDeleteImage: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: { api: authApi } }));
vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('@/features/upload/server/deleteImage', () => ({ deleteImage: mockDeleteImage }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { deleteUserImageAction } from './deleteUserImageAction';

describe('deleteUserImageAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an empty image URL', async () => {
    await expect(deleteUserImageAction('')).resolves.toMatchObject({
      success: false,
      error: 'آدرس تصویر معتبر نیست',
    });
    expect(authApi.getSession).not.toHaveBeenCalled();
  });

  it('rejects a URL that is not the current user image', async () => {
    mockHeaders.mockResolvedValue(new Headers());
    authApi.getSession.mockResolvedValue({
      user: { id: 'user-id', image: 'http://localhost:3000/uploads/current.png' },
    });

    await expect(
      deleteUserImageAction('http://localhost:3000/uploads/other.png')
    ).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('متعلق به شما نیست'),
    });
    expect(mockDeleteImage).not.toHaveBeenCalled();
  });

  it('deletes the image file and clears the profile image', async () => {
    const headersList = new Headers();
    const imageUrl = 'http://localhost:3000/uploads/avatar.png';
    mockHeaders.mockResolvedValue(headersList);
    authApi.getSession.mockResolvedValue({ user: { id: 'user-id', image: imageUrl } });
    mockDeleteImage.mockResolvedValue(undefined);
    authApi.updateUser.mockResolvedValue(undefined);

    await expect(deleteUserImageAction(imageUrl)).resolves.toEqual({ success: true, error: null });
    expect(mockDeleteImage).toHaveBeenCalledWith('/uploads/avatar.png');
    expect(authApi.updateUser).toHaveBeenCalledWith({
      headers: headersList,
      body: { image: null },
    });
  });
});
