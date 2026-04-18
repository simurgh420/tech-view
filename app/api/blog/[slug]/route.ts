// src/app/api/blog/[slug]/route.ts

import { auth } from '@/lib/auth';
import { deletePost, updatePost } from '@/services/blog/db/mutations';
import { getPostBySlug } from '@/services/blog/db/queries';
import prisma from '@/services/db/client';
import { NextResponse } from 'next/server';

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
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const action = post.authorId === session.user.id ? 'update:own' : 'update';

  const permission = await auth.api.userHasPermission({
    headers: req.headers,
    body: { userId: session.user.id, permission: { posts: [action] } },
  });
  if (permission.error || !permission.success) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const updated = await updatePost(slug, body);
    if (!updated) {
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const action = post.authorId === session.user.id ? 'delete:own' : 'delete';
  const permission = await auth.api.userHasPermission({
    headers: req.headers,
    body: { userId: session.user.id, permission: { posts: [action] } },
  });

  if (permission.error || !permission.success) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const deleted = await deletePost(slug);
    if (!deleted) {
      return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
    }
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
