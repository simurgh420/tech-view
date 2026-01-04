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

export interface BrandPayload {
  name: string;
  slug: string;
  logo?: string;
  isActive?: boolean;
}
