// app/api/reviews/route.ts
import { auth } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validation/review';
import { createReview } from '@/services/reviews/db/mutations';
import { getReviewsByProductSlug } from '@/services/reviews/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const product = url.searchParams.get('product');
    if (!product) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }
    const reviews = await getReviewsByProductSlug(product);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('GET /api/reviews Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: { userId: session.user.id, permission: { reviews: ['create'] } },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    const review = await createReview({
      ...parsed.data,
      authorId: session.user.id,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
