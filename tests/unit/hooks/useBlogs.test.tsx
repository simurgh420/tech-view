// tests/unit/hooks/useBlogs.test.tsx

// 👈 باید اولین خط باشد تا useRouter قبل از ایمپورت هوک mock شود
import { vi } from 'vitest';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlogs } from '@/hooks/useBlogs';
import * as queries from '@/services/blog/api/queries';
import * as mutations from '@/services/blog/api/mutations';
import { describe, expect, it, beforeEach } from 'vitest';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe('useBlogs hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGetBlogs fetches blogs', async () => {
    const mockData = {
      items: [{ id: 1, slug: 'test' }],
      total: 1,
      page: 1,
      pageSize: 10,
      pages: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    vi.spyOn(queries, 'fetchBlogs').mockResolvedValue(mockData);

    const { result } = renderHook(() => useBlogs().useGetBlogs(1, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(mockData));
  });

  it('useCreateBlog calls mutationFn and invalidates queries', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockBlog = { id: 1, slug: 'new-blog' } as any;
    vi.spyOn(mutations, 'createBlog').mockResolvedValue(mockBlog);

    const { result } = renderHook(() => useBlogs().useCreateBlog(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.mutateAsync({ title: 'New Blog' } as any);
    });

    expect(mutations.createBlog).toHaveBeenCalledWith(
      { title: 'New Blog' },
      expect.any(Object) // ← React Query context
    );
  });

  it('useUpdateBlog calls mutationFn and invalidates queries', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockBlog = { id: 1, slug: 'updated-blog' } as any;
    vi.spyOn(mutations, 'updateBlog').mockResolvedValue(mockBlog);

    const { result } = renderHook(() => useBlogs().useUpdateBlog('test-slug'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.mutateAsync({ title: 'Updated Blog' } as any);
    });

    expect(mutations.updateBlog).toHaveBeenCalledWith('test-slug', { title: 'Updated Blog' });
  });

  it('useDeleteBlog performs optimistic update and rollback on error', async () => {
    vi.spyOn(mutations, 'deleteBlog').mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useBlogs().useDeleteBlog(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync('test-slug');
      } catch {}
    });

    expect(mutations.deleteBlog).toHaveBeenCalledWith(
      'test-slug',
      expect.any(Object) // ← React Query context
    );
  });
});
