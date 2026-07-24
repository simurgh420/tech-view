'use client';

import { useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { SearchResults } from './SearchResults';

export function SearchInput() {
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query.trim(), 400);

  const shouldSearch = debouncedQuery.length >= 2;

  const { data, isLoading } = useSearch(shouldSearch ? debouncedQuery : '');

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Search Icon */}
        <Search
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="جستجوی محصول، برند یا دسته‌بندی..."
          className="
            h-12
            rounded-2xl

            pr-12
            pl-12

            border-border
            bg-muted/30

            text-right

            transition-all
            duration-200

            focus-visible:ring-2
            focus-visible:ring-primary/20
            focus-visible:border-primary
          "
        />

        {/* Loading */}
        {isLoading && (
          <Loader2
            className="
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              animate-spin
              text-primary
            "
          />
        )}

        {/* Clear */}
        {!isLoading && query.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className="
              absolute
              left-3
              top-1/2
              flex
              h-7
              w-7
              -translate-y-1/2
              items-center
              justify-center
              rounded-full

              text-muted-foreground

              transition

              hover:bg-muted
              hover:text-foreground
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading text */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>در حال جستجو...</span>
        </div>
      )}

      {/* Results */}
      {shouldSearch && data && <SearchResults results={data} />}
    </div>
  );
}
