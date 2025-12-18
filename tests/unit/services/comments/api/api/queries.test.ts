import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchComments } from '@/services/comments/api/queries';
vi.mock('axios');
const mockedAxios = vi.mocked(axios, { deep: true });

describe('Comments API queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should fetch comments by postId', async () => {
    const fakeResponse = [
      {
        id: '1',
        content: 'test',
        author: 'reza',
        rating: 5,
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
      },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: fakeResponse });
    const result = await fetchComments('post-1');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/posts/post-1/comments');
    expect(result).toEqual(fakeResponse);
  });
  // it('should fetch all comments with post info', async () => {
  //   const fakeResponse = [
  //     {
  //       id: '1',
  //       content: 'test',
  //       author: 'reza',
  //       rating: 5,
  //       likes: 0,
  //       dislikes: 0,
  //       createdAt: new Date(),
  //       post: { id: 'post-1', slug: 'test-post', title: 'Test Post' },
  //     },
  //   ];
  //   mockedAxios.get.mockResolvedValueOnce({ data: fakeResponse });
  //   const result = await fetchAllCommentsWithPost();
  //   expect(mockedAxios.get).toHaveBeenCalledWith('/api/dashboard/comments');
  //   expect(result).toEqual(fakeResponse);
  // });
});
