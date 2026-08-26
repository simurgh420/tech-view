import {  NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

import { getAllAttributesAdmin } from '@/services/attributes/db/queries';

async function authorize(permissionName: 'read' | 'update') {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return {
      user: null,
      status: 401 as const,
    };
  }

  const permission = await auth.api.userHasPermission({
    headers: requestHeaders,
    body: {
      userId: session.user.id,
      permissions: {
        categories: [permissionName],
      },
    },
  });

  if (permission.error || !permission.success) {
    return {
      user: null,
      status: 403 as const,
    };
  }

  return {
    user: session.user,
    status: 200 as const,
  };
}

// =====================================================
// GET — لیست کامل مشخصات قابل استفاده
// =====================================================

export async function GET() {
  const startTime = Date.now();

  try {
    const authorization = await authorize('read');

    if (!authorization.user) {
      logger.warn(
        `GET /api/admin/attributes - ${
          authorization.status === 401 ? 'Unauthorized' : 'Forbidden'
        }`,
        { duration: Date.now() - startTime }
      );

      return NextResponse.json(
        { error: authorization.status === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: authorization.status }
      );
    }

    const attributes = await getAllAttributesAdmin();

    logger.info('GET /api/admin/attributes - Success', {
      userId: authorization.user.id,
      count: attributes.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(attributes);
  } catch (error) {
    logger.error('GET /api/admin/attributes failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
