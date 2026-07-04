import { NormalizedSearchResult } from '@/types/search';
import { SearchItem } from './SearchItem';

interface SearchResultsProps {
  results: NormalizedSearchResult[];
}
export function SearchResults({ results }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return <p className="text-sm text-muted-foreground">نتیجه‌ای یافت نشد</p>;
  }

  return (
    <div className="space-y-4">
      {results.map(item => (
        <SearchItem key={item.id} item={item} />
      ))}
    </div>
  );
}
