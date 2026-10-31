// features/upload/client/images.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const post = vi.fn();
  return { default: { post }, post };
});

import axios from 'axios';
import { uploadImage, deleteImage } from './images';

const post = vi.mocked(axios.post);

const createFile = (name = 'photo.png') =>
  new File([new Uint8Array([1, 2, 3])], name, { type: 'image/png' });

describe('upload/client/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should POST to /api/images/upload', async () => {
      post.mockResolvedValue({ data: { imageUrl: '/uploads/a/x.png' } });

      await uploadImage(createFile(), 'products/iphone', 'iphone');

      expect(post).toHaveBeenCalledTimes(1);
      expect(post.mock.calls[0][0]).toBe('/api/images/upload');
    });

    it('should send a FormData with file, folder and baseName', async () => {
      post.mockResolvedValue({ data: { imageUrl: '/uploads/a/x.png' } });
      const file = createFile('my.png');

      await uploadImage(file, 'products/iphone', 'iphone');

      const body = post.mock.calls[0][1] as FormData;
      expect(body).toBeInstanceOf(FormData);
      expect(body.get('folder')).toBe('products/iphone');
      expect(body.get('baseName')).toBe('iphone');

      const sent = body.get('file') as File;
      expect(sent).toBeInstanceOf(File);
      expect(sent.name).toBe('my.png');
      expect(sent.type).toBe('image/png');
      expect(sent.size).toBe(3);
    });

    it('should not set a Content-Type header manually (axios adds the multipart boundary)', async () => {
      post.mockResolvedValue({ data: { imageUrl: '/x.png' } });

      await uploadImage(createFile(), 'a', 'b');

      expect(post.mock.calls[0]).toHaveLength(2);
    });

    it('should return imageUrl from the response', async () => {
      post.mockResolvedValue({ data: { imageUrl: '/uploads/products/x-abcd1234.png' } });

      expect(await uploadImage(createFile(), 'a', 'b')).toBe('/uploads/products/x-abcd1234.png');
    });

    it('should return undefined when the response has no imageUrl (see notes)', async () => {
      post.mockResolvedValue({ data: {} });

      expect(await uploadImage(createFile(), 'a', 'b')).toBeUndefined();
    });

    it('should propagate request errors', async () => {
      const error = new Error('Network Error');
      post.mockRejectedValue(error);

      await expect(uploadImage(createFile(), 'a', 'b')).rejects.toBe(error);
    });

    it('should propagate an axios-style error response untouched', async () => {
      const error = Object.assign(new Error('Request failed with status code 400'), {
        response: { status: 400, data: { error: 'نوع فایل مجاز نیست' } },
      });
      post.mockRejectedValue(error);

      await expect(uploadImage(createFile(), 'a', 'b')).rejects.toMatchObject({
        response: { status: 400, data: { error: 'نوع فایل مجاز نیست' } },
      });
    });
  });

  describe('deleteImage', () => {
    it('should POST imagePath as JSON to /api/images/delete', async () => {
      post.mockResolvedValue({ data: {} });

      await deleteImage('/uploads/a/x.png');

      expect(post).toHaveBeenCalledTimes(1);
      expect(post).toHaveBeenCalledWith('/api/images/delete', { imagePath: '/uploads/a/x.png' });
    });

    it('should resolve to undefined regardless of the response', async () => {
      post.mockResolvedValue({ data: { success: true } });

      await expect(deleteImage('/uploads/a/x.png')).resolves.toBeUndefined();
    });

    it('should propagate request errors', async () => {
      const error = new Error('Forbidden');
      post.mockRejectedValue(error);

      await expect(deleteImage('/uploads/a/x.png')).rejects.toBe(error);
    });
  });
});
