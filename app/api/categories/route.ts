// app/api/categories/route.ts

import { createCategory } from '@/services/categories/db/mutations';
import { getCategories } from '@/services/categories/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load categories' },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = await createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
