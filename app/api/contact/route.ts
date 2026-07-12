// app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createContact } from '@/services/contact/db/mutations';
import { getContacts } from '@/services/contact/db/queries';
import { logger } from '@/lib/logger';
import { contactSchema } from '@/lib/validation/contact';

export async function GET() {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn('GET /api/contact - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permissions: { contacts: ['read'] },
      },
    });
    if (permission.error || !permission?.success) {
      logger.warn('GET /api/contact - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await getContacts();
    logger.info('GET /api/contact succeeded', {
      count: data.length,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(data);
  } catch (error) {
    logger.error('GET /api/contact failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/contact - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map((issue: { path: any[]; message: any }) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const userId = session?.user?.id ?? null;
    await createContact({ ...parsed.data, userId });
    logger.info('POST /api/contact - Contact created', {
      userId: userId || 'anonymous',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/contact failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
