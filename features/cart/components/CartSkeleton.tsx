'use client';

export function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
        >
          <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center gap-2 pt-1">
              <div className="h-6 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-6 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
