import Link from 'next/link';
import { FolderOpen, ChevronLeft } from 'lucide-react';

import { SidebarCard } from './SidebarCard';

export type CategoryItem = {
  name: string;
  slug?: string;
  count?: number;
};

type SidebarCategoriesProps = {
  categories: ReadonlyArray<string | CategoryItem>;
};

export function SidebarCategories({ categories }: SidebarCategoriesProps) {
  if (!categories?.length) return null;

  return (
    <SidebarCard title="دسته‌بندی‌ها" icon={<FolderOpen size={18} />}>
      <div className="space-y-1.5">
        {categories.map(item => {
          const name = typeof item === 'string' ? item : item.name;

          const slug = typeof item === 'string' ? item : (item.slug ?? item.name);

          const count = typeof item === 'object' ? item.count : undefined;

          return (
            <Link
              key={`${slug}-${name}`}
              href={`/blog/category/${encodeURIComponent(slug)}`}
              className="
                group
                flex
                items-center
                justify-between
                rounded-xl
                px-3.5
                py-2.5
                transition-all
                duration-300
                hover:bg-muted/50
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-foreground
                  transition-colors
                  group-hover:text-primary
                "
              >
                {name}
              </span>

              <div className="flex items-center gap-2">
                {typeof count === 'number' && (
                  <span
                    className="
                      rounded-full
                      bg-muted
                      px-2.5
                      py-0.5
                      text-xs
                      font-semibold
                      text-muted-foreground
                      transition-colors
                      group-hover:bg-primary/10
                      group-hover:text-primary
                    "
                  >
                    {count.toLocaleString('fa-IR')}
                  </span>
                )}

                <ChevronLeft
                  className="
                    h-4
                    w-4
                    text-muted-foreground
                    transition-transform
                    duration-300
                    group-hover:-translate-x-1
                    group-hover:text-primary
                  "
                />
              </div>
            </Link>
          );
        })}
      </div>
    </SidebarCard>
  );
}
