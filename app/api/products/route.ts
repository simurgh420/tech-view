// app/api/products/route.ts

import { getProducts } from '@/services/products/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams);
  const data = await getProducts({
    page: parseInt(params.page || '1'),
    pageSize: parseInt(params.pageSize || '20'),
    brand: params.brand,
    category: params.category,
    subCategory: params.subCategory,
    isDiscounted: params.discounted === 'true',
    isFeatured: params.featured === 'true',
    isNew: params.new === 'true',
    inStock: params.inStock === 'true',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort: params.sort as any,
  });
  return NextResponse.json(data);
}
