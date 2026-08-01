// app/api/product-comments/admin/route.ts
import { NextResponse } from 'next/server';
import { getAllCommentsAdmin } from '@/services/productComments/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const comments = await getAllCommentsAdmin();
    return NextResponse.json(comments);
  } catch (error) {
    logger.error('GET /api/product-comments/admin failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json({ message: 'خطا در دریافت دیدگاه‌های محصولات' }, { status: 500 });
  }
}
