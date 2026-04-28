// types/brand.ts

import { CreateBrandInput, EditBrandInput } from '@/lib/validation/brand';

export interface BrandPayload {
  name: string;
  slug?: string;
  logo?: string;
  isActive?: boolean;
}

export type BrandFormProps =
  | {
      mode: 'create';
      initialValues?: never;
      onSubmit: (data: CreateBrandInput) => void;
      isLoading?: boolean;
      slug?: never;
    }
  | {
      mode: 'edit';
      initialValues?: {
        name?: string;
        logo?: string | null;
        isActive?: boolean;
      };
      onSubmit: (data: EditBrandInput) => void;
      isLoading?: boolean;
      slug?: string;
    };
