'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { useState } from 'react';
import { SearchResults } from './SearchResults';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);

  const { data, isLoading } = useSearch(debounced);

  return (
    <div className="space-y-4">
      <input
        className="w-full border rounded-md px-3 py-2"
        placeholder="جستجو..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {isLoading && <p className="text-sm text-muted-foreground">در حال جستجو...</p>}

      {data && <SearchResults results={data} />}
    </div>
  );
}
