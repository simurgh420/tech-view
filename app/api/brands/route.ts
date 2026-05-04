// app/api/brands/route.ts
import { NextResponse } from 'next/server';
import { getBrands } from '@/services/brands/db/queries';
import { createBrand } from '@/services/brands/db/mutations';
import { auth } from '@/lib/auth';
import { createBrandSchema } from '@/lib/validation/brand';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('GET /api/brands Error:', error);
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
      body: {
        userId: session.user.id,
        permission: { brands: ['create'] },
      },
    });
    if (permission.error || !permission.success) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createBrandSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    const brand = await createBrand(parsed.data);
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('POST /api/brands Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
