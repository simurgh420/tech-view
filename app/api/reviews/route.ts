import { createReview } from '@/services/reviews/db/mutations';
import { getReviewsByProductSlug } from '@/services/reviews/db/queries';
import { NextResponse } from 'next/server';

// app/api/reviews/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = url.searchParams.get('product');
  if (!product) {
    return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
  }
  const reviews = await getReviewsByProductSlug(product);
  return NextResponse.json(reviews);
}
export async function POST(req: Request) {
  const body = await req.json();
  const review = await createReview(body);
  return NextResponse.json(review);
}
