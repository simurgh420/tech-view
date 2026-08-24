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

// ✅ تایپ گروه رو جدا تعریف می‌کنیم تا داخل Map<...> پیچیده نشه
type SpecGroup = {
  group: string;
  items: {
    label: string;
    value: string;
    attributeId: string | null; // ✅ اضافه شد
  }[];
};
export function formatProduct<T extends ProductInput>(raw: T): Product {
  const specsMap: Map<string, SpecGroup> = new Map();

  for (const spec of raw.specifications) {
    const label = spec.attribute?.label ?? spec.key;
    const groupName = 'مشخصات فنی';

    if (!specsMap.has(groupName)) {
      specsMap.set(groupName, {
        group: groupName,
        items: [],
      });
    }

    specsMap.get(groupName)!.items.push({
      label,
      value: spec.value,
      attributeId: spec.attributeId, // ✅ اضافه شد
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
