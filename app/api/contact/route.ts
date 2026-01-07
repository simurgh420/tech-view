// app/api/contact/route.ts

import { auth } from '@/lib/auth';
import { contactSchema } from '@/lib/validation/contact.';
import { createContact } from '@/services/contact/db/mutations';

import { getContacts } from '@/services/contact/db/queries';
import { APIError } from 'better-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getContacts();
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  const userId = session?.user.id ?? null;
  try {
    const body = await req.json();
    const parsed = contactSchema.parse(body);
    await createContact({ ...parsed, userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof APIError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'خطای داخلی سرور' }, { status: 500 });
  }
}
