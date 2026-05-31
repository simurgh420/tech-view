import type { BlogPostRecent } from '@/types/blog';
import Link from 'next/link';
import Image from 'next/image';

export function RecentPosts({ items }: { items: BlogPostRecent[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">پست‌های اخیر</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 p-3 border rounded-lg hover:shadow-md transition-all "
          >
            {/* تصویر کاور */}
            <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden ">
              <Image
                src={post.coverImageUrl || '/Image-not-found.png'}
                alt={post.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            {/* متن */}
            <div className="flex flex-col justify-between">
              <h3 className="text-sm font-semibold  group-hover:text-gray-600 transition-colors">
                {post.title}
              </h3>
              {post.publishedAt && (
                <span className="text-xs  mt-2">
                  {new Date(post.publishedAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
