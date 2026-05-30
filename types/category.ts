// types/category.ts

import { CreateCategoryInput, EditCategoryInput } from '@/lib/validation/category';

export interface CategoryPayload {
  title: string;
  slug?: string;
  icon?: string | null;
  order?: number;
  isActive?: boolean;
  parentId?: string | null;
}

export type CategoryFormProps =
  | {
      mode: 'create';
      initialValues?: never;
      onSubmit: (data: CreateCategoryInput) => void;
      isLoading?: boolean;
      parents?: { id: string; title: string }[];
      slug?: never;
    }
  | {
      mode: 'edit';
      initialValues?: {
        title?: string;
        icon?: string | null;
        parentId?: string | null;
      };
      onSubmit: (data: EditCategoryInput) => void;
      isLoading?: boolean;
      parents?: { id: string; title: string }[];
      slug?: string;
    };
