// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProducts, getFilteredProducts } from '@/services/products/db/queries';
import { createProduct } from '@/services/products/db/mutations';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { createProductPayloadSchema } from '@/lib/validation/product';
import { parseSpecsFromURL } from '@/lib/url-helpers';

export async function GET(req: Request) {
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
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. بررسی دسترسی
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { products: ['create'] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. اعتبارسنجی بدنه با Payload Schema (فیلدهای کلاینت)
    const body = await req.json();
    const parsed = createProductPayloadSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    // 4. فراخوانی سرویس ایجاد (سرویس خودش slug یکتا و publishedAt را مدیریت می‌کند)
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products Error:', error);
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
