// src/app/api/blog/[slug]/route.ts

import { auth } from '@/lib/auth';
import { updateBlogSchema } from '@/lib/validation/blog';
import { deletePost, updatePost } from '@/services/blog/db/mutations';
import { getPostBySlug } from '@/services/blog/db/queries';
import prisma from '@/services/db/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// GET ─ دریافت یک پست
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
// PUT ─ ویرایش یک پست
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // 1. احراز هویت
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. پیدا کردن پست

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // 3. بررسی دسترسی (بر اساس مالکیت)
    const action = post.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { posts: [action] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // 4. اعتبارسنجی بدنه درخواست
    const body = await req.json();
    const parsed = updateBlogSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    // 5. اجرای به‌روزرسانی
    const updated = await updatePost(slug, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE ─ حذف یک پست
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // 1. احراز هویت

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. پیدا کردن پست

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // 3. بررسی دسترسی (بر اساس مالکیت)

    const action = post.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { posts: [action] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const result = await deletePost(slug);
    if (result === null) {
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
