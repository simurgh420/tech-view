// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getUserById } from '@/services/users/db/queries';
import { updateUser, updateUserRole, deleteUser } from '@/services/users/db/mutations';
import { canViewUser, canEditUser, canChangeRole, canDeleteUser } from '@/lib/policies/userPolicy';
import { getSessionFromRequest } from '@/lib/auth/getSession';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!canViewUser(session.user, id)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const user = await getUserById(id);
  if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, user });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // اگر نقش ارسال شده → فقط ادمین
  if (body.role !== undefined) {
    if (!canChangeRole(session.user)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (body.role !== 'ADMIN' && body.role !== 'USER') {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const updated = await updateUserRole(id, body.role);
    return NextResponse.json({ success: true, user: updated });
  }

  // اگر فقط پروفایل است
  if (!canEditUser(session.user, id)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.email === 'string') payload.email = body.email.trim();
  if (body.image === null || typeof body.image === 'string') payload.image = body.image;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ message: 'No valid fields' }, { status: 400 });
  }

  const updated = await updateUser(id, payload);
  return NextResponse.json({ success: true, user: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!canDeleteUser(session.user)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const result = await deleteUser(id);
  return NextResponse.json({ success: true, result });
}
