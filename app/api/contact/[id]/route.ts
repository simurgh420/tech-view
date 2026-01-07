// app/api/contact/[id]/route.ts

import { auth } from '@/lib/auth';
import { deleteContact } from '@/services/contact/db/mutations';
import { getContactById } from '@/services/contact/db/queries';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = await getContactById(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = await deleteContact(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
