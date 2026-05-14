import { auth } from '@/lib/auth';
import { createBlogPayloadSchema, createBlogSchema } from '@/lib/validation/blog';
import { createBlogPost } from '@/services/blog/db/mutations';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10) || 10)
    );

    const blogs = await getPublishedPosts({ page, pageSize });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Failed to fetch published posts:', error);
    return NextResponse.json({ error: 'Failed to fetch published posts' }, { status: 500 });
  }
}

// ساخت بلاگ جدید
export async function POST(req: Request) {
  // 1. بررسی احراز هویت
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. بررسی دسترسی برای ایجاد پست
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { posts: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const parsed = createBlogPayloadSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const payload = createBlogSchema.parse({
      ...parsed.data,
      authorId: session.user.id,
    });

    const blog = await createBlogPost(payload);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    // خطاهای غیرمنتظره (مثلاً بدنه JSON نبود)
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
