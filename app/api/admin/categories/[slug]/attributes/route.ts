import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

import prisma from '@/services/db/client';

import { getCategoryAttributesAdmin } from '@/services/categories/db/queries';

import {
  addCategoryAttributeAdmin,
  updateCategoryAttributeAdmin,
  deleteCategoryAttributeAdmin,
  reorderCategoryAttributesAdmin,
} from '@/services/categories/db/mutations';

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function authorize(permission: 'read' | 'update' | 'delete') {
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

  const permissionResult = await auth.api.userHasPermission({
    headers: requestHeaders,
    body: {
      userId: session.user.id,
      permissions: {
        categories: [permission],
      },
    },
  });

  if (permissionResult.error || !permissionResult.success) {
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

/* =========================================================
   GET
========================================================= */

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const { slug } = await params;

  try {
    const authorization = await authorize('read');

    if (!authorization.user) {
      logger.warn(
        `GET /api/admin/categories/${slug}/attributes - ${
          authorization.status === 401 ? 'Unauthorized' : 'Forbidden'
        }`,
        {
          duration: Date.now() - startTime,
        }
      );

      return NextResponse.json(
        {
          error: authorization.status === 401 ? 'Unauthorized' : 'Forbidden',
        },
        {
          status: authorization.status,
        }
      );
    }

    const attributes = await getCategoryAttributesAdmin(slug);

    if (!attributes) {
      logger.info(`GET /api/admin/categories/${slug}/attributes - Category not found`, {
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          error: 'دسته‌بندی پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    logger.info(`GET /api/admin/categories/${slug}/attributes - Success`, {
      userId: authorization.user.id,
      count: attributes.length,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(attributes);
  } catch (error) {
    logger.error(`GET /api/admin/categories/${slug}/attributes failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   Add attribute to category
========================================================= */

export async function POST(req: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const { slug } = await params;

  try {
    const authorization = await authorize('update');

    if (!authorization.user) {
      return NextResponse.json(
        {
          error: authorization.status === 401 ? 'Unauthorized' : 'Forbidden',
        },
        {
          status: authorization.status,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'دسته‌بندی پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    if (!body.attributeId) {
      return NextResponse.json(
        {
          error: 'attributeId الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    const result = await addCategoryAttributeAdmin({
      categoryId: category.id,
      attributeId: body.attributeId,
      isRequired: body.isRequired ?? false,
      isFilterable: body.isFilterable ?? false,
    });

    logger.info(`POST /api/admin/categories/${slug}/attributes - Created`, {
      userId: authorization.user.id,
      attributeId: body.attributeId,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'ATTRIBUTE_ALREADY_ASSIGNED') {
      return NextResponse.json(
        {
          error: 'این مشخصه قبلاً به دسته‌بندی اضافه شده است',
        },
        {
          status: 409,
        }
      );
    }

    logger.error(`POST /api/admin/categories/${slug}/attributes failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH
   Update required / filterable / order
========================================================= */

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const { slug } = await params;

  try {
    const authorization = await authorize('update');

    if (!authorization.user) {
      return NextResponse.json(
        {
          error: authorization.status === 401 ? 'Unauthorized' : 'Forbidden',
        },
        {
          status: authorization.status,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'دسته‌بندی پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    /* ---------- Reorder ---------- */

    if (body.action === 'reorder') {
      if (!Array.isArray(body.items)) {
        return NextResponse.json(
          {
            error: 'items must be an array',
          },
          {
            status: 400,
          }
        );
      }

      await reorderCategoryAttributesAdmin(category.id, body.items);

      logger.info(`PATCH /api/admin/categories/${slug}/attributes - Reordered`, {
        userId: authorization.user.id,
        count: body.items.length,
        duration: Date.now() - startTime,
      });

      return NextResponse.json({
        success: true,
      });
    }

    /* ---------- Update single attribute ---------- */

    if (!body.id) {
      return NextResponse.json(
        {
          error: 'id الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        id: body.id,
        categoryId: category.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: 'مشخصه پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    const data: {
      isRequired?: boolean;
      isFilterable?: boolean;
      order?: number;
    } = {};

    if (body.isRequired !== undefined) {
      data.isRequired = Boolean(body.isRequired);
    }

    if (body.isFilterable !== undefined) {
      data.isFilterable = Boolean(body.isFilterable);
    }

    if (body.order !== undefined) {
      data.order = Number(body.order);
    }

    const result = await updateCategoryAttributeAdmin(body.id, data);

    logger.info(`PATCH /api/admin/categories/${slug}/attributes - Updated`, {
      userId: authorization.user.id,
      attributeId: body.id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(`PATCH /api/admin/categories/${slug}/attributes failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const startTime = Date.now();
  const { slug } = await params;

  try {
    const authorization = await authorize('delete');

    if (!authorization.user) {
      return NextResponse.json(
        {
          error: authorization.status === 401 ? 'Unauthorized' : 'Forbidden',
        },
        {
          status: authorization.status,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'دسته‌بندی پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          error: 'id الزامی است',
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        id,
        categoryId: category.id,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: 'مشخصه پیدا نشد',
        },
        {
          status: 404,
        }
      );
    }

    await deleteCategoryAttributeAdmin(id);

    logger.info(`DELETE /api/admin/categories/${slug}/attributes - Deleted`, {
      userId: authorization.user.id,
      attributeId: id,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    logger.error(`DELETE /api/admin/categories/${slug}/attributes failed`, {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}
