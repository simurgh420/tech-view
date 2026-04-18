import { auth } from '@/lib/auth';
import { createBlogPost } from '@/services/blog/db/mutations';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 10);

    const blogs = await getPublishedPosts({ page, pageSize });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Failed to fetch published posts:', error);
    return NextResponse.json({ error: 'Failed to fetch published posts' }, { status: 500 });
  }
}

// ساخت بلاگ جدید
export async function POST(req: Request) {
  try {
    // 1. بررسی احراز هویت
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. بررسی دسترسی برای ایجاد پست
    const permission = await auth.api.userHasPermission({
      headers: req.headers,
      body: {
        userId: session.user.id,
        permission: { posts: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const blogData = { ...body, authorId: session.user.id };
    const blog = await createBlogPost(blogData);
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
