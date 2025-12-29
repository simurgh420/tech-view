// app/api/users/[id]/route.ts

import { deleteUser, updateUser } from '@/services/users/db/mutations';
import { getUserById } from '@/services/users/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`GET /api/users/${id} Error:`, error);
    return NextResponse.json({ success: false, message: 'Failed to load user' }, { status: 500 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const user = await updateUser(id, body);
    return NextResponse.json(user);
  } catch (error) {
    console.error(`PATCH /api/users/${id} Error:`, error);
    return NextResponse.json({ success: false, message: 'Failed to update user' }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await deleteUser(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/users/${id} Error:`, error);
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
