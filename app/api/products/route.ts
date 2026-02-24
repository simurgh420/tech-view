// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProducts, getFilteredProducts } from '@/services/products/db/queries';
import { createProduct } from '@/services/products/db/mutations';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const filters = {
      brandSlug: sp.get('brandSlug') ?? undefined,
      categorySlug: sp.get('categorySlug') ?? undefined,
      subCategorySlug: sp.get('subCategorySlug') ?? undefined,
      minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      ram: sp.getAll('ram'),
      sort: sp.get('sort') as 'featured' | 'price-asc' | 'price-desc' | 'new' | undefined,
      q: sp.get('q') ?? undefined,
      page: sp.get('page') ? Math.max(1, Number(sp.get('page'))) : undefined,
      perPage: sp.get('perPage') ? Math.max(1, Number(sp.get('perPage'))) : undefined,
    };

    const noFilters =
      !filters.brandSlug &&
      !filters.categorySlug &&
      !filters.subCategorySlug &&
      filters.minPrice === undefined &&
      filters.maxPrice === undefined &&
      (!filters.ram || filters.ram.length === 0) &&
      !filters.q &&
      !filters.page &&
      !filters.perPage;

    const products = noFilters ? await getProducts() : await getFilteredProducts(filters);

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // اعتبارسنجی سطحی
    if (!body || typeof body.title !== 'string' || typeof body.price === 'undefined') {
      return NextResponse.json(
        { success: false, message: 'Invalid product payload' },
        { status: 400 }
      );
    }
    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, message: 'قیمت محصول معتبر نیست' },
        { status: 400 }
      );
    }

    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
