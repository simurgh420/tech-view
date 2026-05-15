// app/api/contact/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { deleteContact } from '@/services/contact/db/mutations';
import { getContactById } from '@/services/contact/db/queries';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`GET /api/contact/${id} - Unauthorized`, { duration: Date.now() - startTime });
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
      logger.warn(`GET /api/contact/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contact = await getContactById(id);
    if (!contact) {
      logger.info(`GET /api/contact/${id} - Not found`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    logger.info(`GET /api/contact/${id} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json(contact);
  } catch (error) {
    logger.error(`GET /api/contact/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      logger.warn(`DELETE /api/contact/${id} - Unauthorized`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { contacts: ['delete'] },
      },
    });
    if (!permission?.success) {
      logger.warn(`DELETE /api/contact/${id} - Forbidden`, {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await deleteContact(id);
    if (result === null) {
      logger.info(`DELETE /api/contact/${id} - Not found`, { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    logger.info(`DELETE /api/contact/${id} - Success`, { duration: Date.now() - startTime });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`DELETE /api/contact/${id} failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
