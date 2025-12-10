import type { BlogPostRecent } from '@/types/blog';
import Link from 'next/link';

export function RecentPosts({ items }: { items: BlogPostRecent[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
      <ul className="space-y-3">
        {items.map(post => (
          <li key={post.slug} className="flex items-center justify-between">
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm text-gray-800 hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>

            <span className="text-xs text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
