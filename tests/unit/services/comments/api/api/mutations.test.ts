import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
  likeCommentApi,
  dislikeCommentApi,
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
      author: 'reza',
      rating: 5,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
    };
    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse });
    const result = await addCommentApi('post-1', { author: 'reza', content: 'test', rating: 5 });
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/posts/post-1/comments', {
      author: 'reza',
      content: 'test',
      rating: 5,
    });
    expect(result).toEqual(fakeResponse);
  });
  it('should update a comment', async () => {
    const fakeResponse = {
      id: '1',
      content: 'updated',
      author: 'reza',
      rating: 4,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
    };
    mockedAxios.put.mockResolvedValueOnce({ data: fakeResponse });
    const result = await updateCommentApi('1', { content: 'updated', rating: 4 });
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
  it('should like a comment', async () => {
    const fakeResponse = { id: '1', likes: 1 };
    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse });
    const result = await likeCommentApi('1');
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/comments/1/like');
    expect(result).toEqual(fakeResponse);
  });
  it('should dislike a comment', async () => {
    const fakeResponse = { id: '1', dislikes: 1 };
    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse });
    const result = await dislikeCommentApi('1');
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/comments/1/dislike');
    expect(result).toEqual(fakeResponse);
  });
});
