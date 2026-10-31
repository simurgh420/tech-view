// types/search.ts

export interface NormalizedBlog {
  type: 'blog';
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string | null;
  publishedAt?: Date | null;
  tags: string[];
}

export interface NormalizedProduct {
  type: 'product';
  id: string;
  title: string;
  slug: string;
  description: string;
  price: any;
  image?: string | null;
  brand?: string | null;
  category?: string | null;
  subCategory?: string | null;
}

export interface NormalizedCategory {
  type: 'category';
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  parent?: string | null;
}

export interface NormalizedTag {
  type: 'tag';
  id: string;
  title: string;
  slug: string;
}

export type NormalizedSearchResult = NormalizedBlog | NormalizedProduct | NormalizedCategory;
