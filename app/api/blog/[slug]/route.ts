import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { updateBlogSchema } from '@/lib/validation/blog';
import { deletePost, updatePost } from '@/services/blog/db/mutations';
import { getPostBySlug } from '@/services/blog/db/queries';
import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';

// GET ─ دریافت یک پست
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      logger.warn(`GET /api/blog/${slug} - Not found`);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.info(`GET /api/blog/${slug} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(post);
  } catch (error) {
    logger.error(`GET /api/blog/[slug] failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT ─ ویرایش یک پست
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`PUT /api/blog/${slug} - Unauthorized`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      logger.warn(`PUT /api/blog/${slug} - Post not found`);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const action = post.authorId === session.user.id ? 'update:own' : 'update';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { posts: [action] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`PUT /api/blog/${slug} - Forbidden`, { userId: session.user.id });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateBlogSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`PUT /api/blog/${slug} - Validation failed`, { errors: parsed.error.issues });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const updated = await updatePost(slug, parsed.data);
    if (!updated) {
      logger.warn(`PUT /api/blog/${slug} - Post not found during update`);
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    logger.info(`PUT /api/blog/${slug} - Updated`, {
      blogId: updated.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error(`PUT /api/blog/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE ─ حذف یک پست
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const startTime = Date.now();
  const { slug } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/blog/${slug} - Unauthorized`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      logger.warn(`DELETE /api/blog/${slug} - Post not found`);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const action = post.authorId === session.user.id ? 'delete:own' : 'delete';
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { posts: [action] } },
    });
    if (permission.error || !permission.success) {
      logger.warn(`DELETE /api/blog/${slug} - Forbidden`, { userId: session.user.id });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deletePost(slug);
    if (result === null) {
      logger.warn(`DELETE /api/blog/${slug} - Post not found during delete`);
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    logger.info(`DELETE /api/blog/${slug} - Deleted`, { duration: Date.now() - startTime });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/blog/${slug} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
