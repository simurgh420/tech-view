// src/app/api/admin/categories/[slug]/attributes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/services/db/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی پیدا نشد' }, { status: 404 });
    }

    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: { categoryId: category.id },
      orderBy: { order: 'asc' },
      include: {
        attribute: {
          include: {
            options: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    const result = categoryAttributes.map(ca => ({
      attributeId: ca.attributeId,
      key: ca.attribute.key,
      label: ca.attribute.label,
      type: ca.attribute.type,
      unit: ca.attribute.unit,
      isRequired: ca.isRequired,
      options: ca.attribute.options.map(o => o.value),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/admin/categories/[slug]/attributes failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
