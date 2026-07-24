'use client';

import { SearchX } from 'lucide-react';

import { NormalizedSearchResult } from '@/types/search';
import { SearchItem } from './SearchItem';

interface SearchResultsProps {
  results: NormalizedSearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center

          rounded-2xl
          border
          border-dashed

          py-12
          text-center
        "
      >
        <SearchX className="mb-4 h-10 w-10 text-muted-foreground/50" />

        <h3 className="text-sm font-semibold">نتیجه‌ای پیدا نشد</h3>

        <p className="mt-2 text-sm text-muted-foreground">عبارت دیگری را امتحان کنید.</p>
      </div>
    );
  }

  return (
    <div
      className="
        max-h-[55vh]
        overflow-y-auto

        rounded-2xl
        border

        bg-background

        p-2

        scrollbar-thin
      "
    >
      <div className="space-y-1">
        {results.map(item => (
          <SearchItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
