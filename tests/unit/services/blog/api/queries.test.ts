// tests/unit/services/blog/api/queries.test.ts

import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { fetchBlogs, fetchBlogBySlug } from '@/services/blog/api/queries';

vi.mock('axios');
describe('blog queries', () => {
  it('fetchBlogs sends GET request with params and returns data', async () => {
    const mockData = { blogs: [{ id: 1, title: 'Test Blog' }], total: 1 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.get as any).mockResolvedValue({ data: mockData });

    const result = await fetchBlogs(2, 5);
    expect(axios.get).toHaveBeenCalledWith('/api/blog', { params: { page: 2, pageSize: 5 } });
    expect(result).toEqual(mockData);
  });
  it('fetchBlogBySlug sends GET request and returns data', async () => {
    const mockData = { id: 1, title: 'Test Blog', slug: 'test-blog' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.get as any).mockResolvedValue({ data: mockData });
    const result = await fetchBlogBySlug('test-blog');

    expect(axios.get).toHaveBeenCalledWith('/api/blog/test-blog');
    expect(result).toEqual(mockData);
  });
});
