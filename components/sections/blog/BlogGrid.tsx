// src/components/blog/BlogGrid.tsx

import { BlogPostSafe } from '@/types/blog';
import { BlogCard } from './BlogCard';

export function BlogGrid({ posts }: { posts: BlogPostSafe[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">Blog Posts</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {posts.map(p => (
          <BlogCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
