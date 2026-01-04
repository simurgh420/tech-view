'use client';

import type { FAQCategory } from '@/types/faq';
import Link from 'next/link';

export function FaqSidebar({ categories }: { categories: FAQCategory[] }) {
  return (
    <aside className="sticky top-24 space-y-6">
      <h3 className="text-base font-semibold text-gray-900">Table of Contents</h3>

      <nav className="flex flex-col gap-3">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`#${category.id}`}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            {category.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
