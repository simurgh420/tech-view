// app/api/contact/route.ts

import { auth } from '@/lib/auth';
import { contactSchema } from '@/lib/validation/contact.';
import { createContact } from '@/services/contact/db/mutations';

import { getContacts } from '@/services/contact/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { contacts: ['read'] },
      },
    });
    if (!permission?.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await getContacts();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/contact Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    // 1. دریافت سشن (اختیاری – کاربر می‌تواند ناشناس هم پیام بگذارد)
    const session = await auth.api.getSession({ headers: await headers() });

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    const userId = session?.user?.id ?? null;
    await createContact({ ...parsed.data, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/contact Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
