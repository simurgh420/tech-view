// types/product.ts
export type ProductSpecifications = Record<string, unknown>;
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
  isInStock: boolean;
  rating?: string | null;
  reviewCount: number;
  thumbnail?: string | null;
  images: string[];

  specifications: ProductSpecifications;
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
  price: string; // send as string for Decimal
  discountPrice?: string | null;
  discountPercentage?: number | null;
  isDiscounted?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  stockQuantity?: number;
  isInStock?: boolean;
  thumbnail?: string | null;
  images?: string[];

  specifications?: ProductSpecifications;
  brandSlug: string; // connect by slug
  categorySlug: string; // connect by slug
  subCategorySlug?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
}
