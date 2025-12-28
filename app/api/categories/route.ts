// app/api/categories/route.ts

import { getCategories } from '@/services/categories/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}
