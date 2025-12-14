// app/blog/page.tsx

import { BlogGrid } from '@/components/sections/blog/BlogGrid';
import { RecentPosts } from '@/components/sections/blog/RecentPosts';
import { getPublishedPosts, getRecentPosts } from '@/services/blog/queries';
export const revalidate = 3600; // صفحه هر 1 ساعت یکبار regenerate
export const metadata = {
  title: 'Tech Heim Blog • News, Guides, and Reviews',
  description:
    'Latest tech articles, videos, and insights on phones, laptops, audio, gaming, and more.',
  openGraph: {
    title: 'Tech Heim Blog',
    description: 'Tech news, how-tos, and product reviews.',
    type: 'website',
    // url: 'https://yourdomain.com/blog', // اینجا باید ادرس درست وارد شود
    images: [{ url: '/og/blog.jpg', width: 1200, height: 630 }],
  },
};
export default async function BlogPage() {
  const { items } = await getPublishedPosts({
    page: 1,
    pageSize: 12,
  });
  const recent = await getRecentPosts(3);

  return (
    <main className="container mx-auto max-w-[1224px] px-4 py-8">
      <BlogGrid posts={items} />
      <RecentPosts items={recent} />
    </main>
  );
}
