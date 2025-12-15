import { createBlogPost } from '@/services/blog/db/mutations';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 10);

  const blogs = await getPublishedPosts({ page, pageSize });
  return NextResponse.json(blogs);
}

// ساخت بلاگ جدید
export async function POST(req: Request) {
  const body = await req.json();
  const blog = await createBlogPost(body);
  return NextResponse.json(blog);
}
