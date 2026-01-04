// app/api/brands/route.ts
import { NextResponse } from 'next/server';
import { getBrands } from '@/services/brands/db/queries';
import { createBrand } from '@/services/brands/db/mutations';

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('GET /api/brands Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load brands' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brand = await createBrand(body);
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('POST /api/brands Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
