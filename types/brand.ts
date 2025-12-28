// types/brand.ts

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProductCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  rating?: number;
  reviewCount: number;
}

export interface BrandWithProducts extends Brand {
  products: BrandProductCard[];
}
