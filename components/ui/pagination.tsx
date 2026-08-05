import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string; // مثلا "/blog"
};

function buildHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const delta = 1;

  const range = new Set<number>();
  range.add(1);
  range.add(total);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i > 1 && i < total) range.add(i);
  }

  const sorted = Array.from(range).sort((a, b) => a - b);

  let prev: number | undefined;
  for (const page of sorted) {
    if (prev !== undefined && page - prev > 1) pages.push('ellipsis');
    pages.push(page);
    prev = page;
  }

  return pages;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-1.5 py-8">
      {/* قبلی */}
      <PaginationButton
        href={currentPage > 1 ? buildHref(basePath, currentPage - 1) : undefined}
        disabled={currentPage <= 1}
        ariaLabel="صفحه‌ی قبل"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>

      {/* شماره صفحه‌ها */}
      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-neutral-500">
            …
          </span>
        ) : (
          <PaginationButton
            key={page}
            href={buildHref(basePath, page)}
            active={page === currentPage}
          >
            {page.toLocaleString('fa-IR')}
          </PaginationButton>
        )
      )}

      {/* بعدی */}
      <PaginationButton
        href={currentPage < totalPages ? buildHref(basePath, currentPage + 1) : undefined}
        disabled={currentPage >= totalPages}
        ariaLabel="صفحه‌ی بعد"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationButton>
    </nav>
  );
}

type PaginationButtonProps = {
  href?: string;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
};

function PaginationButton({ href, active, disabled, ariaLabel, children }: PaginationButtonProps) {
  const base =
    'flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors';

  if (disabled || !href) {
    return (
      <span className={`${base} cursor-not-allowed text-neutral-600`} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`${base} ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
