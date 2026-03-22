'use client';

import { useEffect, useState } from 'react';
import type { FAQCategory } from '@/types/faq';
import Link from 'next/link';

export function FaqSidebar({ categories }: { categories: FAQCategory[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    categories.forEach(category => {
      const el = document.getElementById(category.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  return (
    <aside className="sticky top-24 text-right">
      <h3 className="text-base font-semibold  mb-4">فهرست مطالب</h3>

      <nav className="flex flex-col gap-2">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`#${category.id}`}
            className={`
              text-sm
              pr-3
              transition-colors
              border-r-2
              rounded-sm
              ${
                activeId === category.id
                  ? 'border-gray-400'
                  : 'text-gray-400 border-transparent hover:text-black dark:hover:text-white hover:border-gray-500'
              }
            `}
          >
            {category.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
