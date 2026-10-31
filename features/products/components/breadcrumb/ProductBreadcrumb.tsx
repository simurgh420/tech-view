// components/product/breadcrumb/ProductBreadcrumb.tsx

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function ProductBreadcrumb({ items }: Props) {
  return (
    <nav
      aria-label="breadcrumb"
      className="
        flex
        items-center
        gap-2

        overflow-x-auto
        whitespace-nowrap
        flex-nowrap

        py-2

        text-sm
        text-muted-foreground
      "
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className="
              flex
              items-center
              gap-2
              shrink-0
            "
          >
            {isLast ? (
              <span
                className="
                  font-medium
                  text-foreground
                "
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="
                  transition-colors
                  hover:text-primary
                "
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}

            {!isLast && (
              <ChevronRight
                size={16}
                className="
                  text-muted-foreground/60
                  shrink-0
                "
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
