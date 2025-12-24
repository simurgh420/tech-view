import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { PostActions } from './PostActions';
type Props = {
  post: BlogPost;
};
export function PostContent({ post }: Props) {
  return (
    <main className="container mx-auto max-w-[1224px] px-4 py-10" dir="auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-6 flex items-center gap-4">
        <span>🖊 {post.author}</span>
        <span>📅 {new Date(post.publishedAt).toLocaleDateString('fa-IR')}</span>
        <span>⏱ {post.readingMinutes} دقیقه مطالعه</span>
      </div>
      <div className="mb-6">
        <PostActions slug={post.slug} />
      </div>
      {post.coverImageUrl && (
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden mb-8 shadow-md">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={808}
            height={414}
            className="object-cover"
          />
        </div>
      )}
      <div
        className="prose prose-neutral max-w-none text-justify leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      {post.tags.length > 0 && (
        <div className="mt-10">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">برچسب‌ها:</h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <span key={tag.id} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
