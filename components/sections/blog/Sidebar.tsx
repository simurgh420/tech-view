// src/components/blog/Sidebar.tsx

import { getRecentPosts, getTagsByPostId } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';

export async function Sidebar({ postId }: { postId: string }) {
  const categories = ['Technology Trends', 'Gaming Insights', 'Security & Privacy'];

  const recentPosts = await getRecentPosts();
  const tags = await getTagsByPostId(postId);
  return (
    <aside className="w-full lg-x-[300px] flex flex-col gap-8">
      {/* دسته‌بندی‌ها */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">📂 دسته‌بندی‌ها</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          {categories.map(cat => (
            <li key={cat} className="hover:text-blue-600 cursor-pointer">
              {cat}
            </li>
          ))}
        </ul>
      </div>
      {/* پست‌های اخیر */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">🕘 پست‌های اخیر</h4>
        <ul className="space-y-4">
          {recentPosts.map(post => (
            <li key={post.slug} className="flex items-center gap-3">
              <Link href={`/blog/${post.slug}`} className="flex items-center gap-3 group">
                <div className="w-16 h-16 rounded overflow-hidden shrink-0">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-2">
                    {post.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* تگ‌ها */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">🏷 تگ‌ها</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 cursor-pointer hover:bg-blue-100"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
