import { Brand, Category } from '@/app/generated/prisma/client';

// types/product.ts
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string; // Decimal serialized as string
  discountPrice?: string | null;
  discountPercentage?: number | null;
  isDiscounted: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stockQuantity: number;
  rating?: string | null;
  reviewCount: number;
  thumbnail?: string | null;
  images: string[];
  brand?: Brand;
  category?: Category;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications: any;
  brandId: string;
  categoryId: string;
  subCategoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface ProductPayload {
  title: string;
  slug: string;
  description: string;
  price: number; // send as string for Decimal
  discountPrice?: number | null;

  discountPercentage?: number | null;
  isDiscounted?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  stockQuantity?: number;
  isInStock?: boolean;
  thumbnail?: string | null;
  images?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications?: any;
  brandSlug: string; // connect by slug
  categorySlug: string; // connect by slug
  subCategorySlug?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
}
export type FiltersProduct = {
  brandSlug?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  ram?: string[];
  page?: number;
  perPage?: number;
  q?: string;
};
