// services/products/db/mutations.ts
import prisma from '@/services/db/client';
import { Product, ProductPayload, SpecsGroup } from '@/types/product';

export async function createProduct(data: ProductPayload): Promise<Product> {
  const priceNum = Number(data.price);
  const discountNum = data.discountPrice ? Number(data.discountPrice) : null;

  const isDiscounted = discountNum !== null && discountNum < priceNum;
  const discountPercentage = isDiscounted
    ? Math.round(((priceNum - discountNum) / priceNum) * 100)
    : null;

  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: priceNum,
      discountPrice: discountNum,
      discountPercentage,
      isDiscounted,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
      stockQuantity: data.stockQuantity ?? 0,
      thumbnail: data.thumbnail ?? null,
      images: data.images ?? [],
      keyFeatures: data.keyFeatures ?? [],
      colors: data.colors ?? [],
      variants: data.variants ?? [],
      specifications: data.specifications ?? {},
      status: data.status ?? 'PUBLISHED',

      brand: { connect: { slug: data.brandSlug } },
      category: { connect: { slug: data.categorySlug } },
      ...(data.subCategorySlug ? { subCategory: { connect: { slug: data.subCategorySlug } } } : {}),
    },
    include: {
      brand: true,
      category: true,
      subCategory: true,
    },
  });

  return {
    ...product,

    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    discountPercentage: product.discountPercentage ?? null,
    isDiscounted: product.isDiscounted,

    rating: product.rating ? product.rating.toString() : null,

    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,

    keyFeatures: product.keyFeatures as string[],
    colors: product.colors as { name: string; hex: string }[],
    variants: product.variants as { ram: string; storage: string }[],
    images: product.images as string[],
    specifications: product.specifications as SpecsGroup[],

    brand: product.brand,
    category: product.category,

    brandId: product.brandId,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,

    reviewCount: product.reviewCount,
    status: product.status,
  };
}
export async function updateProduct(
  oldSlug: string,
  data: Partial<ProductPayload>
): Promise<Product> {
  const priceNum = data.price !== undefined ? Number(data.price) : undefined;
  const discountNum =
    data.discountPrice !== undefined && data.discountPrice !== null
      ? Number(data.discountPrice)
      : undefined;

  let isDiscounted: boolean | undefined;
  let discountPercentage: number | null | undefined;

  if (priceNum !== undefined && discountNum !== undefined) {
    isDiscounted = discountNum < priceNum;
    discountPercentage = isDiscounted
      ? Math.round(((priceNum - discountNum) / priceNum) * 100)
      : null;
  }

  const product = await prisma.product.update({
    where: { slug: oldSlug },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description && { description: data.description }),
      ...(priceNum !== undefined && { price: priceNum }),
      ...(discountNum !== undefined && { discountPrice: discountNum }),
      ...(discountPercentage !== undefined && { discountPercentage }),
      ...(isDiscounted !== undefined && { isDiscounted }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isNew !== undefined && { isNew: data.isNew }),
      ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.keyFeatures !== undefined && { keyFeatures: data.keyFeatures }),
      ...(data.colors !== undefined && { colors: data.colors }),
      ...(data.variants !== undefined && { variants: data.variants }),
      ...(data.specifications !== undefined && { specifications: data.specifications }),
      ...(data.status && { status: data.status }),
      ...(data.publishedAt !== undefined && {
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      }),
      ...(data.brandSlug && { brand: { connect: { slug: data.brandSlug } } }),
      ...(data.categorySlug && { category: { connect: { slug: data.categorySlug } } }),
      ...(data.subCategorySlug !== undefined &&
        (data.subCategorySlug
          ? { subCategory: { connect: { slug: data.subCategorySlug } } }
          : { subCategory: { disconnect: true } })),
    },
    include: { brand: true, category: true, subCategory: true },
  });

  return {
    ...product,

    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    discountPercentage: product.discountPercentage ?? null,
    isDiscounted: product.isDiscounted,

    rating: product.rating ? product.rating.toString() : null,

    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,

    keyFeatures: (product.keyFeatures ?? []) as string[],
    colors: (product.colors ?? []) as { name: string; hex: string }[],
    variants: (product.variants ?? []) as { ram: string; storage: string }[],
    images: (product.images ?? []) as string[],
    specifications: product.specifications as SpecsGroup[],
    brand: product.brand,
    category: product.category,

    brandId: product.brandId,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,

    reviewCount: product.reviewCount,
    status: product.status,
  };
}

export async function deleteProduct(slug: string) {
  await prisma.product.delete({ where: { slug } });
  return { success: true };
}
