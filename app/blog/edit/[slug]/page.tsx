'use client';
import { BlogForm } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { useGetBlog, useUpdateBlog } = useBlogs();

  const { data: blog, isLoading } = useGetBlog(slug);
  const updateMutation = useUpdateBlog(slug);

  if (isLoading) return <div>Loading...</div>;
  if (!blog) return <div>Not found</div>;

  const initialValues = {
    title: blog.title,
    excerpt: blog.excerpt,
    coverImageUrl: blog.coverImageUrl,
    content: blog.content,
    author: blog.author,
    tags: blog.tags.map((t: { tag: { name: string } }) => t.tag.name),
  };

  return (
    <BlogForm
      initialValues={initialValues}
      onSubmit={data => updateMutation.mutate(data, { onSuccess: () => router.push('/blog') })}
    />
  );
}
