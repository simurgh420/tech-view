import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from '@/services/comments/api/mutations';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, { deep: true });

describe('Comments API mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a comment', async () => {
    const fakeResponse = {
      id: '1',
      content: 'test',
      rating: 5,
      createdAt: new Date(),
      author: {
        id: 'user-1',
        name: 'Reza',
        image: 'https://example.com/avatar.png',
      },
    };

    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse });

    const result = await addCommentApi('post-1', {
      content: 'test',
      rating: 5,
    });

    // انتظار: بدون authorId (چون در سمت سرور از session گرفته می‌شود)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/posts/post-1/comments', {
      content: 'test',
      rating: 5,
    });

    expect(result).toEqual(fakeResponse);
  });

  it('should update a comment', async () => {
    const fakeResponse = {
      id: '1',
      content: 'updated',
      rating: 4,
      createdAt: new Date(),
      author: {
        id: 'user-1',
        name: 'Reza',
        image: 'https://example.com/avatar.png',
      },
    };

    mockedAxios.put.mockResolvedValueOnce({ data: fakeResponse });

    const result = await updateCommentApi('1', {
      content: 'updated',
      rating: 4,
    });

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/comments/1', {
      content: 'updated',
      rating: 4,
    });

    expect(result).toEqual(fakeResponse);
  });

  it('should delete a comment', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    const result = await deleteCommentApi('1');

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/comments/1');
    expect(result).toEqual({ success: true });
  });
});
