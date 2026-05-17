// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getProducts, getFilteredProducts } from '@/services/products/db/queries';
import { createProduct } from '@/services/products/db/mutations';
import { createProductPayloadSchema } from '@/lib/validation/product';
import { parseSpecsFromURL } from '@/lib/url-helpers';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;
    const specs = parseSpecsFromURL(sp);
    const filters = {
      brandSlug: sp.get('brandSlug') ?? undefined,
      categorySlug: sp.get('categorySlug') ?? undefined,
      subCategorySlug: sp.get('subCategorySlug') ?? undefined,
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      sort: (sp.get('sort') as any) ?? undefined,
      q: sp.get('q') ?? undefined,
      page: sp.get('page') ? Math.max(1, Number(sp.get('page'))) : undefined,
      perPage: sp.get('perPage') ? Math.max(1, Number(sp.get('perPage'))) : undefined,
      specs,
    };

    const hasFilters = Object.values(filters).some(
      v => v !== undefined && (!Array.isArray(v) || v.length > 0)
    );

    const products = hasFilters ? await getFilteredProducts(filters) : await getProducts();
    const count = hasFilters ? ((products as any).items?.length ?? 0) : (products as any[]).length;
    logger.info('GET /api/products succeeded', {
      hasFilters,
      count,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(products);
  } catch (error) {
    logger.error('GET /api/products failed', {
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
    if (!session?.user) {
      logger.warn('POST /api/products - Unauthorized', { duration: Date.now() - startTime });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { products: ['create'] } },
    });
    if (permission.error || !permission.success) {
      logger.warn('POST /api/products - Forbidden', {
        userId: session.user.id,
        duration: Date.now() - startTime,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductPayloadSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('POST /api/products - Validation failed', {
        errors: parsed.error.issues,
        duration: Date.now() - startTime,
      });
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const product = await createProduct(parsed.data);
    logger.info('POST /api/products - Product created', {
      productId: product.id,
      userId: session.user.id,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    logger.error('POST /api/products failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
