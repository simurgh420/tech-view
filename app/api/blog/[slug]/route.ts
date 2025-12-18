// src/app/api/blog/[slug]/route.ts

import { deletePost, updatePost } from '@/services/blog/db/mutations';
import { getPostBySlug } from '@/services/blog/db/queries';
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
  try {
    const body = await req.json();
    const { slug } = await params;
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
  try {
    const { slug } = await params;
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
