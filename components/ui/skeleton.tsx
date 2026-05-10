import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  پایهٔ Skeleton با انیمیشن shimmer                                */
/* ------------------------------------------------------------------ */
type SkeletonProps = {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: number | string;
  height?: number | string;
};

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  const base =
    'relative isolate overflow-hidden bg-gray-200 dark:bg-gray-800 ' +
    'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent';

  const variants: Record<string, string> = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    card: 'rounded-xl h-64 w-full',
  };

  return (
    <div
      role="status"
      aria-label="در حال بارگذاری"
      className={cn(base, variants[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  ترکیبات آماده برای استفادهٔ فوری                                 */
/* ------------------------------------------------------------------ */

/** چند خط متن (مثلاً برای توضیحات یا پاراگراف) */
export function SkeletonParagraph({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="در حال بارگذاری">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-3 w-full" />
      ))}
    </div>
  );
}

/** کارت محصول (مناسب لیست فروشگاهی) */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900',
        className
      )}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <Skeleton variant="rect" className="aspect-square w-full rounded-lg" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="mt-auto flex items-center justify-between pt-2">
        <Skeleton variant="rect" className="h-8 w-20 rounded-lg" />
        <Skeleton variant="circle" width={36} height={36} />
      </div>
    </div>
  );
}

/** لودینگ کامل صفحهٔ جزئیات محصول */
export function SkeletonProductDetail() {
  return (
    <div
      className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-12"
      role="status"
      aria-label="در حال بارگذاری"
    >
      {/* گالری */}
      <div className="space-y-4 lg:col-span-5">
        <Skeleton variant="rect" className="aspect-square w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-20 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* اطلاعات */}
      <div className="space-y-4 lg:col-span-4">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <div className="flex gap-4 pt-4">
          <Skeleton variant="rect" className="h-10 w-28 rounded-lg" />
          <Skeleton variant="rect" className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* باکس قیمت */}
      <div className="lg:col-span-3">
        <Skeleton variant="card" className="h-48 w-full" />
      </div>
    </div>
  );
}

/** لودینگ کامل صفحه (هدر + محتوا) */
export function SkeletonPage() {
  return (
    <div className="space-y-6 p-6" role="status" aria-label="در حال بارگذاری">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="rect" className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
