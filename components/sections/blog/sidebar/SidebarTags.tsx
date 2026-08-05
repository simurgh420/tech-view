import Link from 'next/link';
import { Tags } from 'lucide-react';

import { SidebarCard } from './SidebarCard';

type SidebarTag = {
  name: string;
  slug: string;
};

type SidebarTagsProps = {
  tags: SidebarTag[];
};

export function SidebarTags({ tags }: SidebarTagsProps) {
  if (!tags.length) return null;

  return (
    <SidebarCard title="تگ‌ها" icon={<Tags size={18} />}>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link
            key={tag.slug}
            href={`/blog/tag/${encodeURIComponent(tag.slug.toLowerCase())}`}
            className="
              rounded-full
              border
              border-border
              bg-muted/30
              px-3
              py-1.5
              text-xs
              font-medium
              text-foreground
              transition-all
              duration-300
              hover:border-primary/30
              hover:bg-primary
              hover:text-primary-foreground
            "
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </SidebarCard>
  );
}
