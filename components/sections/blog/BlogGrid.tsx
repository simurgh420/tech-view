// src/components/blog/BlogGrid.tsx

import { BlogPostSafe } from '@/types/blog';
import { BlogCard } from './BlogCard';

export function BlogGrid({ posts }: { posts: BlogPostSafe[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Blog Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map(p => (
          <BlogCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
