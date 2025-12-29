'use client';

import { BlogForm, BlogFormType } from '@/components/sections/blog/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import axios from 'axios';
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

  async function handleSubmit(data: BlogFormType) {
    let imageUrl: string = blog?.coverImageUrl ?? '';

    // ✅ اگر فایل جدید انتخاب شده بود → آپلود کن
    if (data.coverImageUrl instanceof File) {
      const formData = new FormData();
      formData.append('file', data.coverImageUrl);
      formData.append('folder', `blogs/${slug}/cover`);
      formData.append('baseName', data.title);

      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      imageUrl = res.data.imageUrl;

      // ✅ حذف عکس قبلی
      await axios.post('/api/images/delete', {
        imagePath: blog?.coverImageUrl,
      });
    }

    // ✅ ساخت payload صحیح برای API
    const payload = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      tags: data.tags,
      coverImageUrl: imageUrl, // ✅ همیشه string
    };

    updateMutation.mutate(payload, {
      onSuccess: () => router.push('/blog'),
    });
  }

  return <BlogForm initialValues={initialValues} onSubmit={handleSubmit} />;
}
