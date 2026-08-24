// hooks/useCategoryAttributes.ts

import { useQuery } from '@tanstack/react-query';

import { fetchCategoryAttributesApi } from '@/services/categories/api/queries';

// --------------------------------------------------
// Types
// --------------------------------------------------

export type AttributeType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'ENUM';

export interface CategoryAttributeOption {
  attributeId: string;
  key: string;
  label: string;
  type: AttributeType;
  unit: string | null;
  isRequired: boolean;
  options: string[];
}

// --------------------------------------------------
// Query Keys
// --------------------------------------------------

export const categoryAttributeKeys = {
  all: ['category-attributes'] as const,

  byCategory: (categorySlug: string) => ['category-attributes', categorySlug] as const,
};

// --------------------------------------------------
// Queries
// --------------------------------------------------

export function useGetCategoryAttributes(categorySlug: string) {
  return useQuery<CategoryAttributeOption[]>({
    queryKey: categoryAttributeKeys.byCategory(categorySlug),

    queryFn: () => fetchCategoryAttributesApi(categorySlug),

    enabled: Boolean(categorySlug),

    staleTime: 1000 * 60 * 10,
  });
}
