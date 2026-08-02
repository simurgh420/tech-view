// services/products/utils/formatProduct.ts

import { Prisma } from '@/app/generated/prisma/client';
import { Product } from '@/types/product';
import { productIncludes, productWithReviews } from '../productIncludes';

type ProductInput =
  | Prisma.ProductGetPayload<{
      include: typeof productIncludes;
    }>
  | Prisma.ProductGetPayload<{
      include: typeof productWithReviews;
    }>;

export function formatProduct<T extends ProductInput>(raw: T): Product {
  const specsMap = new Map<
    string,
    {
      group: string;
      items: {
        label: string;
        value: string;
      }[];
    }
  >();

  for (const spec of raw.specifications) {
    const groupName = spec.groupName ?? 'سایر';

    if (!specsMap.has(groupName)) {
      specsMap.set(groupName, {
        group: groupName,
        items: [],
      });
    }

    specsMap.get(groupName)!.items.push({
      label: spec.key,
      value: spec.value,
    });
  }

  const specifications = Array.from(specsMap.values());

  const reviews = 'reviews' in raw ? raw.reviews : undefined;

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,

    price: raw.price.toString(),
    discountPrice: raw.discountPrice?.toString() ?? null,
    discountPercentage: raw.discountPercentage,

    isDiscounted: raw.isDiscounted,
    isFeatured: raw.isFeatured,
    isNew: raw.isNew,

    stockQuantity: raw.stockQuantity,

    thumbnail: raw.thumbnail,
    images: raw.images,

    keyFeatures: raw.keyFeatures,

    // چون این دو فیلد Json هستند
    colors: raw.colors as Product['colors'],
    variants: raw.variants as Product['variants'],

    specifications,

    status: raw.status,

    rating: raw.rating?.toString() ?? null,
    reviewCount: raw.reviewCount,

    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    publishedAt: raw.publishedAt?.toISOString() ?? null,

    brand: raw.brand,
    category: raw.category,
    subCategory: raw.subCategory,

    ...(reviews && {
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        authorId: review.authorId,
        user: review.user,
      })),
    }),
  };
}
