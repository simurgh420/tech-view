// types/category.ts

export interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProductCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  rating?: number;
  reviewCount: number;
}

export interface CategoryWithProducts extends Category {
  products: CategoryProductCard[];
}
