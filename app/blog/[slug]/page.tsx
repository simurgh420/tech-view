import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dehydrate } from '@tanstack/react-query';
import Hydrate from '@/components/providers/hydrate';
import { PostContent } from '@/components/sections/blog/PostContent';
import { Sidebar } from '@/components/sections/blog/Sidebar';
import { CommentsSection } from '@/components/sections/comments/CommentsSection';
import { getQueryClient } from '@/lib/query/query-client';
import { getPostBySlug } from '@/services/blog/db/queries';
import { getCommentsByPostId } from '@/services/comments/db/queries';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);

  if (!post) {
    return {
      title: 'مقاله یافت نشد • TechView',
    };
  }

  const ogImage = post.coverImageUrl || '/Image-not-found.png';

  return {
    title: `${post.title} • TechView`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);

  if (!post) {
    notFound();
  }

  const qc = getQueryClient();

  await qc.prefetchQuery({
    queryKey: ['comments', post.id],
    queryFn: () => getCommentsByPostId(post.id),
  });

  const dehydratedState = dehydrate(qc);

  return (
    <div dir="rtl" className="container mx-auto max-w-7xl px-4 py-10">
      {/* گرید ۱۲ ستونه استاندارد با items-start برای عملکرد صحیح Sticky */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* ستون راست: محتوای مقاله + کامنت‌ها (۸ ستون در دسکتاپ، ۹ ستون در مانیتورهای بزرگ) */}
        <main className="space-y-12 min-w-0 lg:col-span-8 xl:col-span-9">
          <PostContent post={post} />

          <Hydrate state={dehydratedState}>
            <CommentsSection postId={post.id} />
          </Hydrate>
        </main>

        {/* ستون چپ: سایدبار (۴ ستون در دسکتاپ، ۳ ستون در مانیتورهای بزرگ) */}
        <aside className="w-full lg:col-span-4 xl:col-span-3">
          <Sidebar postId={post.id} />
        </aside>
      </div>
    </div>
  );
}
