import { Brand, Category, ProductPrice, Review } from '@/app/generated/prisma/client';

// types/product.ts

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;

  price: string;
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

  // JSON fields
  keyFeatures: string[];
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];

  specifications: Record<string, { label: string; value: string | number }[]>;

  // Relations
  brand?: Brand;
  category?: Category;
  subCategory?: Category | null;

  prices: ProductPrice[];
  reviews: Review[];

  brandId: string;
  categoryId: string;
  subCategoryId?: string | null;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;

  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export type ProductPayload = {
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  brandSlug: string;
  categorySlug: string;
  subCategorySlug?: string | null;
  slug: string;
  stockQuantity: number;
  thumbnail: string | null;
  images: string[];
  keyFeatures: string[];
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];
  specifications?: { group: string; items: { label: string; value: string | number }[] }[];
  isFeatured: boolean;
  isNew: boolean;
  publishedAt?: string | null;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
};
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
