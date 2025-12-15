import Hydrate from '@/components/providers/hydrate';
import { PostContent } from '@/components/sections/blog/PostContent';
import { Sidebar } from '@/components/sections/blog/Sidebar';
import { CommentsSection } from '@/components/sections/comments/CommentsSection';
import { getQueryClient } from '@/lib/query/query-client';
import { getPostBySlug } from '@/services/blog/db/queries';
import { getCommentsByPostId } from '@/services/comments/db/queries';
import { dehydrate } from '@tanstack/react-query';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const deCodeSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(deCodeSlug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} • Tech Heim`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://yourdomain.com/blog/${post.slug}`,
      images: [{ url: post.coverImageUrl, width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://yourdomain.com/blog/${post.slug}` },
  };
}
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const deCodeSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(deCodeSlug);
  if (!post) {
    return <div>Not found</div>;
  }
  const qc = getQueryClient();
  await qc.prefetchQuery({
    queryKey: ['comments', post.id],
    queryFn: () => getCommentsByPostId(post.id),
  });
  const dehydratedState = dehydrate(qc);
  return (
    <div className="container mx-auto max-w-[1224px] px-4 py-10 grid grid-cols-1 lg:grid-cols-[880px_1fr] gap-12">
      <PostContent post={post} />
      <Sidebar postId={post.id} />
      <Hydrate state={dehydratedState}>
        <CommentsSection postId={post.id} />
      </Hydrate>
    </div>
  );
}
