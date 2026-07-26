// hooks/useSearch.ts
import { searchApi, searchQueryKey } from '@/services/search/api/queries';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 400);

  return useQuery({
    queryKey: searchQueryKey(debouncedQuery),
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
}
