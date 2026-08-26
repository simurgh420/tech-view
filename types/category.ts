// types/category.ts

import { AttributeCategory } from '@/app/generated/prisma/enums';
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

export type AttributeType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM';

export type AttributeCategoryId = AttributeCategory;

export interface CategoryAttributeOption {
  id: string;
  attributeId: string;
  key: string;
  label: string;
  type: AttributeType;
  unit: string | null;
  category: AttributeCategoryId; // 👈 اضافه شد
  isRequired: boolean;
  isFilterable: boolean;
  order: number;
  options: string[];
}

export interface AdminAttribute {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  unit: string | null;
  category: AttributeCategoryId; // 👈 اضافه شد
  options: Array<{
    id: string;
    value: string;
    order: number;
  }>;
}
