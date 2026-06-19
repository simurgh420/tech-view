'use client';

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between items-center animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-4 w-6 bg-muted rounded" />
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-4 w-10 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
