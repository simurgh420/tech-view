// app/api/brands/route.ts

import { getBrands } from '@/services/brands/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const brands = await getBrands();
  return NextResponse.json(brands);
}
