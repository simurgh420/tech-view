// src/components/blog/BlogCard.tsx

import { BlogPostSafe } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';

export function BlogCard({ post }: { post: BlogPostSafe }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="relative h-40">
        <Image src={post.coverImageUrl} alt={post.title} fill className=" object-cover" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(post.publishedAt).toLocaleDateString()} •{post.readingMinutes}min read
        </p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{post.excerpt}</p>
      </div>
    </Link>
  );
}
