// app/api/admin/categories/[slug]/attributes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getCategoryAttributesAdmin } from '@/services/categories/db/queries';

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  const startTime = Date.now();

  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      logger.warn('GET /api/admin/categories/[slug]/attributes - Unauthorized');

      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // Params
    // --------------------------------------------------

    const { slug } = await params;

    // --------------------------------------------------
    // Query
    // --------------------------------------------------

    const attributes = await getCategoryAttributesAdmin(slug);

    // --------------------------------------------------
    // Not found
    // --------------------------------------------------

    if (!attributes) {
      logger.warn(`GET /api/admin/categories/${slug}/attributes - Category not found`);

      return NextResponse.json(
        {
          error: 'Not found',
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    logger.info(`GET /api/admin/categories/${slug}/attributes - Success`, {
      count: attributes.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(attributes);
  } catch (error) {
    logger.error('GET /api/admin/categories/[slug]/attributes failed', {
      error: error instanceof Error ? error.message : 'Unknown',

      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch category attributes',
      },
      {
        status: 500,
      }
    );
  }
}
