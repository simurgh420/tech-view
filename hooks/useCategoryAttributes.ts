// hooks/useCategoryAttributes.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

export function useCategoryAttributes(categorySlug: string) {
  return useQuery<CategoryAttributeOption[]>({
    queryKey: ['category-attributes', categorySlug],
    queryFn: async () => {
      const res = await axios.get<CategoryAttributeOption[]>(
        `/api/admin/categories/${categorySlug}/attributes`
      );
      return res.data;
    },
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 10,
  });
}
