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
      <h3 className="mb-4 text-base font-semibold text-foreground">فهرست مطالب</h3>

      <nav className="flex flex-col gap-2">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`#${category.id}`}
            className={`
              rounded-sm border-s-2 ps-3 text-sm transition-colors
              ${
                activeId === category.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
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
