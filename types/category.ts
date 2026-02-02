// types/category.ts

export interface CategoryPayload {
  title: string;
  slug: string;
  icon?: string | null;
  order?: number;
  isActive?: boolean;
  parentId?: string | null;
}
