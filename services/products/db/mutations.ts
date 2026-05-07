import prisma from '@/services/db/client';
import type { CreateProductInput, UpdateProductInput } from '@/lib/validation/product';
import { Prisma } from '@/app/generated/prisma/client';

// محاسبهٔ تخفیف
function calculateDiscount(price: number, discountPrice: number | null) {
  if (discountPrice !== null && discountPrice < price) {
    return {
      isDiscounted: true,
      discountPercentage: Math.round(((price - discountPrice) / price) * 100),
    };
  }
  return { isDiscounted: false, discountPercentage: null };
}
// بررسی یکتا بودن slug
async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}
// فرمت کردن خروجی
function formatProduct(product: any) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    discountPrice: product.discountPrice?.toString() ?? null,
    discountPercentage: product.discountPercentage ?? null,
    isDiscounted: product.isDiscounted,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    stockQuantity: product.stockQuantity,
    thumbnail: product.thumbnail ?? null,
    images: product.images ?? [],
    keyFeatures: product.keyFeatures ?? [],
    colors: product.colors ?? [],
    variants: product.variants ?? [],
    specifications: product.specifications ?? [],
    status: product.status,
    rating: product.rating?.toString() ?? null,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt?.toISOString() ?? null,
    brand: product.brand ?? null,
    category: product.category ?? null,
    subCategory: product.subCategory ?? null,
  };
}

// ایجاد محصول جدید
export async function createProduct(data: CreateProductInput) {
  const priceNum = data.price;
  const discountNum = data.discountPrice ?? null;
  const { isDiscounted, discountPercentage } = calculateDiscount(priceNum, discountNum);

  try {
    const slugUnique = await isSlugUnique(data.slug);
    if (!slugUnique) throw new Error(`Slug "${data.slug}" already exists`);

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: priceNum,
        discountPrice: discountNum,
        discountPercentage,
        isDiscounted,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        stockQuantity: data.stockQuantity,
        thumbnail: data.thumbnail,
        images: data.images,
        keyFeatures: data.keyFeatures,
        colors: data.colors,
        variants: data.variants,
        specifications: data.specifications,
        status: data.status,
        brand: { connect: { slug: data.brandSlug } },
        category: { connect: { slug: data.categorySlug } },
        ...(data.subCategorySlug
          ? { subCategory: { connect: { slug: data.subCategorySlug } } }
          : {}),
        publishedAt: data.publishedAt
          ? new Date(data.publishedAt)
          : data.status === 'PUBLISHED'
            ? new Date()
            : null,
      },
      include: { brand: true, category: true, subCategory: true },
    });

    return formatProduct(product);
  } catch (error: any) {
    if (error.code === 'P2002') throw new Error(`Product with slug "${data.slug}" already exists`);
    throw error;
  }
}

// به‌روزرسانی محصول
export async function updateProduct(slug: string, data: UpdateProductInput) {
  const existing = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true, subCategory: true },
  });
  if (!existing) return null;

  const updateData: Prisma.ProductUpdateInput = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.keyFeatures !== undefined) updateData.keyFeatures = data.keyFeatures;
  if (data.colors !== undefined) updateData.colors = data.colors;
  if (data.variants !== undefined) updateData.variants = data.variants;
  if (data.specifications !== undefined) updateData.specifications = data.specifications;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.isNew !== undefined) updateData.isNew = data.isNew;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.publishedAt !== undefined) {
    updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }

  if (data.slug !== undefined && data.slug !== slug) {
    const slugUnique = await isSlugUnique(data.slug, existing.id);
    if (!slugUnique) throw new Error(`Slug "${data.slug}" is already taken`);
    updateData.slug = data.slug;
  }

  if (data.brandSlug !== undefined) updateData.brand = { connect: { slug: data.brandSlug } };
  if (data.categorySlug !== undefined)
    updateData.category = { connect: { slug: data.categorySlug } };
  if (data.subCategorySlug === null) {
    updateData.subCategory = { disconnect: true };
  } else if (data.subCategorySlug !== undefined) {
    updateData.subCategory = { connect: { slug: data.subCategorySlug } };
  }

  const finalPrice = data.price ?? Number(existing.price);
  let finalDiscountPrice: number | null = null;
  if (data.discountPrice !== undefined) {
    finalDiscountPrice = data.discountPrice;
  } else if (existing.discountPrice) {
    finalDiscountPrice = Number(existing.discountPrice);
  }

  const { isDiscounted, discountPercentage } = calculateDiscount(finalPrice, finalDiscountPrice);
  if (data.price !== undefined || data.discountPrice !== undefined) {
    updateData.price = finalPrice;
    updateData.discountPrice = finalDiscountPrice;
    updateData.isDiscounted = isDiscounted;
    updateData.discountPercentage = discountPercentage;
  }

  const product = await prisma.product.update({
    where: { slug },
    data: updateData,
    include: { brand: true, category: true, subCategory: true },
  });

  return formatProduct(product);
}

// حذف محصول
export async function deleteProduct(slug: string): Promise<boolean> {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return false;
  await prisma.product.delete({ where: { slug } });
  return true;
}
