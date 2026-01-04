// types/category.ts
export interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  order: number;
  isActive: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  title: string;
  slug: string;
  icon?: string | null;
  order?: number;
  isActive?: boolean;
  parentId?: string | null;
}
