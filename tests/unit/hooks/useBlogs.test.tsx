// tests/unit/hooks/useBlogs.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useGetBlogs,
  useGetBlog,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  blogKeys,
} from '@/hooks/useBlogs';

import * as queries from '@/services/blog/api/queries';
import * as mutations from '@/services/blog/api/mutations';
import { BlogListResponse } from '@/types/blog';

// ─── Mock API ها ──────────────────────────────────────────
vi.mock('@/services/blog/api/queries', () => ({
  fetchBlogsApi: vi.fn(),
  fetchBlogBySlugApi: vi.fn(),
}));

vi.mock('@/services/blog/api/mutations', () => ({
  createBlogApi: vi.fn(),
  updateBlogApi: vi.fn(),
  deleteBlogApi: vi.fn(),
}));

// ─── Wrapper تست ──────────────────────────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

// ─── تست‌ها ──────────────────────────────────────────────
describe('useBlogs hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetBlogs', () => {
    it('should fetch blogs with pagination', async () => {
      const mockResponse: BlogListResponse = {
        items: [
          {
            id: '1',
            slug: 'test',
            title: 'Test',
            excerpt: '',
            coverImageUrl: null,
            readingMinutes: 0,
            publishedAt: null,
            authorName: null,
            tags: [],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pages: 1,
      };
      (queries.fetchBlogsApi as any).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetBlogs(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(queries.fetchBlogsApi).toHaveBeenCalledWith(1, 10);
    });

    it('should handle error', async () => {
      const error = new Error('Network error');
      (queries.fetchBlogsApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetBlogs(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetBlog', () => {
    const slug = 'test-slug';
    const mockBlog = { id: '1', slug, title: 'Test' };

    it('should fetch blog by slug when provided', async () => {
      (queries.fetchBlogBySlugApi as any).mockResolvedValue(mockBlog);

      const { result } = renderHook(() => useGetBlog(slug), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBlog);
      expect(queries.fetchBlogBySlugApi).toHaveBeenCalledWith(slug);
    });

    it('should not fetch when slug is falsy', () => {
      renderHook(() => useGetBlog(''), { wrapper: createWrapper() });
      expect(queries.fetchBlogBySlugApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateBlog', () => {
    // اصلاح: اضافه کردن فیلدهای مورد نیاز (excerpt, tags)
    const input = {
      title: 'New Blog',
      content: 'Content',
      excerpt: 'Short excerpt',
      tags: ['tag1', 'tag2'],
    };
    const createdBlog = { id: '1', slug: 'new-blog', ...input };

    it('should create blog and invalidate blogs query', async () => {
      (mutations.createBlogApi as any).mockResolvedValue(createdBlog);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateBlog(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // mutationFn مستقیماً createBlogApi است → با input و context صدا زده می‌شود
      expect(mutations.createBlogApi).toHaveBeenCalledWith(input, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: blogKeys.all });
    });
  });

  describe('useUpdateBlog', () => {
    const slug = 'test-slug';
    const data = { title: 'Updated Blog' };
    const updatedBlog = { id: '1', slug: 'updated-slug', title: 'Updated Blog' };

    it('should update blog and invalidate queries', async () => {
      (mutations.updateBlogApi as any).mockResolvedValue(updatedBlog);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateBlog(slug), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(data);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // mutationFn: data => updateBlogApi(slug, data) → فقط با data صدا زده می‌شود
      expect(mutations.updateBlogApi).toHaveBeenCalledWith(slug, data);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: blogKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: blogKeys.detail(updatedBlog.slug),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: blogKeys.detail(slug) });
    });
  });

  describe('useDeleteBlog', () => {
    const slug = 'test-slug';

    it('should delete blog and invalidate blogs query', async () => {
      (mutations.deleteBlogApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteBlog(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(slug);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // mutationFn مستقیماً deleteBlogApi است → با slug و context صدا زده می‌شود
      expect(mutations.deleteBlogApi).toHaveBeenCalledWith(slug, expect.anything());
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: blogKeys.all });
    });

    it('should handle optimistic update and rollback on error', async () => {
      const error = new Error('Delete failed');
      (mutations.deleteBlogApi as any).mockRejectedValue(error);

      const queryClient = new QueryClient();
      // داده‌های اولیه کش (با شناسه‌های رشتهای)
      const initialData: BlogListResponse = {
        items: [
          {
            id: '1',
            slug: 'test-slug',
            title: 'Test',
            excerpt: '',
            coverImageUrl: null,
            readingMinutes: 0,
            publishedAt: null,
            authorName: null,
            tags: [],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        pages: 1,
      };
      queryClient.setQueryData(blogKeys.list(1, 10), initialData);

      const { result } = renderHook(() => useDeleteBlog(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      // اجرای mutation با خطا
      try {
        await result.current.mutateAsync(slug);
      } catch {
        // خطا انتظار می‌رود
      }

      // باید داده‌ها به حالت قبلی برگردند
      expect(queryClient.getQueryData(blogKeys.list(1, 10))).toEqual(initialData);
      expect(mutations.deleteBlogApi).toHaveBeenCalledWith(slug, expect.anything());
    });
  });
});
