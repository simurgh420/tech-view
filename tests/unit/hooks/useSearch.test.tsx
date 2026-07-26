import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSearch } from '@/hooks/useSearch';
import * as searchQueries from '@/services/search/api/queries';
import * as useDebounceModule from '@/hooks/useDebounce';

// Mock useDebounce
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value: string) => value), // به‌طور پیش‌فرض همان value را برمی‌گرداند
}));

// Mock searchApi و searchQueryKey
vi.mock('@/services/search/api/queries', () => ({
  searchApi: vi.fn(),
  searchQueryKey: vi.fn((query: string) => ['search', query]),
}));

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

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when query is empty', () => {
    // اطمینان از اینکه useDebounce مقدار خالی را برمی‌گرداند
    (useDebounceModule.useDebounce as any).mockReturnValue('');
    const { result } = renderHook(() => useSearch(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(searchQueries.searchApi).not.toHaveBeenCalled();
  });

  it('should fetch when debounced query is non-empty', async () => {
    const mockResults = [{ id: '1', title: 'Product' }];
    (useDebounceModule.useDebounce as any).mockReturnValue('test');
    (searchQueries.searchApi as any).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResults);
    expect(searchQueries.searchApi).toHaveBeenCalledWith('test');
    expect(searchQueries.searchQueryKey).toHaveBeenCalledWith('test');
  });

  it('should use debounced value for query key', async () => {
    (useDebounceModule.useDebounce as any).mockReturnValue('debounced');
    (searchQueries.searchApi as any).mockResolvedValue([]);

    renderHook(() => useSearch('initial'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(searchQueries.searchQueryKey).toHaveBeenCalledWith('debounced');
      expect(searchQueries.searchApi).toHaveBeenCalledWith('debounced');
    });
  });

  it('should not fetch if debounced query becomes empty', () => {
    (useDebounceModule.useDebounce as any).mockReturnValue('');
    renderHook(() => useSearch('   '), {
      wrapper: createWrapper(),
    });
    expect(searchQueries.searchApi).not.toHaveBeenCalled();
  });
});
