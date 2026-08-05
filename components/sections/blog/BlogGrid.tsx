// src/components/blog/BlogGrid.tsx

import { BlogPostSafe } from '@/types/blog';
import { BlogCard } from './BlogCard';

export function BlogGrid({ posts }: { posts: BlogPostSafe[] }) {
  return (
    <section>
      
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
        {posts.map(p => (
          <BlogCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
