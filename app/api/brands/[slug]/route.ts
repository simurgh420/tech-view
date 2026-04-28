// app/api/brands/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getBrandBySlug } from '@/services/brands/db/queries';
import { updateBrandBySlug, deleteBrandBySlug } from '@/services/brands/db/mutations';
import { auth } from '@/lib/auth';
import { editBrandSchema } from '@/lib/validation/brand';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const brand = await getBrandBySlug(slug);

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error(`GET /api/brands/${slug} Error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const permission = await auth.api.userHasPermission({
    headers: req.headers,
    body: {
      userId: session.user.id,
      permission: { brands: ['update'] },
    },
  });
  if (permission.error || !permission.success) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = editBrandSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }

    const brand = await updateBrandBySlug(slug, parsed.data);
    return NextResponse.json(brand);
  } catch (error) {
    console.error(`PATCH /api/brands/${slug} Error:`, error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const permission = await auth.api.userHasPermission({
    headers: req.headers,
    body: {
      userId: session.user.id,
      permission: { brands: ['delete'] },
    },
  });
  if (permission.error || !permission.success) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const result = await deleteBrandBySlug(slug);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`DELETE /api/brands/${slug} Error:`, error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
