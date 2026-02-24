// components/product/breadcrumb/ProductBreadcrumb.tsx
'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type Crumb = {
  label: string;
  href?: string;
};

export default function ProductBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap py-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* لینک‌دار یا غیر لینک‌دار */}
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
            ) : (
              <Link href={item.href || '#'} className="hover:text-blue-600 transition">
                {item.label}
              </Link>
            )}

            {/* جداکننده */}
            {!isLast && <ChevronLeft size={16} className="text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}
