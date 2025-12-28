// services/products/db/mutations.ts
import prisma from '@/services/db/client';
import { Product, ProductPayload } from '@/types/product';

export async function createProduct(data: ProductPayload): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      discountPercentage: data.discountPercentage ?? null,
      isDiscounted: data.isDiscounted ?? false,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
      stockQuantity: data.stockQuantity ?? 0,
      isInStock: data.isInStock ?? false,
      thumbnail: data.thumbnail ?? null,
      images: data.images ?? [],
      specifications: data.specifications ?? {},
      status: data.status ?? 'DRAFT',
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      brand: { connect: { slug: data.brandSlug } },
      category: { connect: { slug: data.categorySlug } },
      ...(data.subCategorySlug ? { subCategory: { connect: { slug: data.subCategorySlug } } } : {}),
    },
  });
  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    rating: product.rating ? product.rating.toString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
  };
}
export async function updateProduct(slug: string, data: Partial<ProductPayload>): Promise<Product> {
  const product = await prisma.product.update({
    where: { slug },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.price && { price: data.price }),
      ...(data.discountPrice !== undefined && { discountPrice: data.discountPrice }),
      ...(data.discountPercentage !== undefined && { discountPercentage: data.discountPercentage }),
      ...(data.isDiscounted !== undefined && { isDiscounted: data.isDiscounted }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isNew !== undefined && { isNew: data.isNew }),
      ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
      ...(data.isInStock !== undefined && { isInStock: data.isInStock }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.images !== undefined && { images: data.images }),
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
  });
  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
    rating: product.rating ? product.rating.toString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    publishedAt: product.publishedAt ? product.publishedAt.toISOString() : null,
  };
}
export async function deleteProduct(slug: string) {
  await prisma.product.delete({ where: { slug } });
  return { success: true };
}
