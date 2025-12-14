// src/app/api/blog/[slug]/route.ts

import { deletePost, updatePost } from '@/services/blog/mutations';
import { getPostBySlug } from '@/services/blog/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const body = await req.json();
  const { slug } = await params;
  const updated = await updatePost(slug, body);
  if (!updated) {
    return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deleted = await deletePost(slug);
  if (!deleted) {
    return NextResponse.json({ error: 'Post Not found' }, { status: 404 });
  }
  return NextResponse.json(deleted);
}
