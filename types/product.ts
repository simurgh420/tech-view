// types/product.ts
export type SpecsItem = {
  label: string;
  value: string | number;
};

export type SpecsGroup = {
  group: string;
  items: SpecsItem[];
};

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
export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string | null;
  discountPercentage: number | null;
  isDiscounted: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stockQuantity: number;
  thumbnail: string | null;
  images: string[];
  keyFeatures: string[];
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];
  specifications: { group: string; items: { label: string; value: string }[] }[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  rating: string | null;
  reviewCount: number;
  reviews?: {
    rating: number;
    content: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; title: string; slug: string } | null;
  subCategory: { id: string; title: string; slug: string } | null;
};

export type FiltersProduct = {
  brandSlug?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'new';
  q?: string;
  page?: number;
  perPage?: number;
  specs?: Record<string, string>;
};
