// app/api/users/[id]/route.ts

import { deleteUser, updateUser } from '@/services/users/db/mutations';
import { getUserById } from '@/services/users/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const user = await updateUser(id, body);
  return NextResponse.json(user);
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await deleteUser(id);
  return NextResponse.json(result);
}
