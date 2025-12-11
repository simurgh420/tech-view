import { createBlogPost } from '@/services/blog/mutations';
import { NextResponse } from 'next/server';

// ساخت بلاگ جدید
export async function POST(req: Request) {
  const body = await req.json();
  const { title, excerpt, content, coverImageUrl, author } = body;
  const blog = await createBlogPost({ title, excerpt, content, coverImageUrl, author });
  return NextResponse.json(blog);
}
