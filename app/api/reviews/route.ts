// app/api/reviews/route.ts
import { createReview } from '@/services/reviews/db/mutations';
import { getReviewsByProductSlug } from '@/services/reviews/db/queries';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const product = url.searchParams.get('product');
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product slug is required' },
        { status: 400 }
      );
    }
    const reviews = await getReviewsByProductSlug(product);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('GET /api/reviews Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load reviews' },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const review = await createReview(body);
    return NextResponse.json(review);
  } catch (error) {
    console.error('POST /api/reviews Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create review' },
      { status: 500 }
    );
  }
}
