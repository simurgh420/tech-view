// tests/unit/services/blog/api/mutations.test.ts
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { createBlogApi, deleteBlogApi, updateBlogApi } from '@/services/blog/api/mutations';
vi.mock('axios');
describe('blog mutations', () => {
  it('createBlog sends POST request and returns data', async () => {
    const mockData = { id: 1, title: 'Test Blog' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.post as any).mockResolvedValue({ data: mockData });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createBlogApi({ title: 'Test Blog' } as any);
    expect(axios.post).toHaveBeenCalledWith('/api/blog', { title: 'Test Blog' });
    expect(result).toEqual(mockData);
  });
  it('updateBlog sends PUT request and returns data', async () => {
    const mockData = { id: 1, title: 'Updated Blog' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.put as any).mockResolvedValue({ data: mockData });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await updateBlogApi('test-slug', { title: 'Updated Blog' } as any);
    expect(axios.put).toHaveBeenCalledWith('/api/blog/test-slug', { title: 'Updated Blog' });
    expect(result).toEqual(mockData);
  });
  it('deleteBlog sends DELETE request and returns data', async () => {
    const mockData = { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.delete as any).mockResolvedValue({ data: mockData });
    const result = await deleteBlogApi('test-slug');
    expect(axios.delete).toHaveBeenCalledWith('/api/blog/test-slug');
    expect(result).toEqual(mockData);
  });
});
