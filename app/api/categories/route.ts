// app/api/categories/route.ts

import { auth } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validation/category';
import { createCategory } from '@/services/categories/db/mutations';
import { getCategories } from '@/services/categories/db/queries';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    // ۱. احراز هویت
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ۲. چک دسترسی
    const permission = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        userId: session.user.id,
        permission: { categories: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ۳. اعتبارسنجی بدنه

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
