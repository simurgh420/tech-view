import { searchApi, searchQueryKey } from '@/services/search/api/queries';
import { useQuery } from '@tanstack/react-query';

export function useSearch(query: string) {
  return useQuery({
    queryKey: searchQueryKey(query),
    queryFn: () => searchApi(query),
    enabled: query.length > 0,
  });
}
