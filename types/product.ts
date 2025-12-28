// types/product.ts
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  isDiscounted: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stockQuantity: number;
  isInStock: boolean;
  rating?: number;
  reviewCount: number;
  thumbnail?: string;
  images: string[];
  specifications: Record<string, string>;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
