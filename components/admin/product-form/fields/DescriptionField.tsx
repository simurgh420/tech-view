'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';
import EditorClient from '@/components/editors/EditorClient';

type Props = { control: Control<ProductFormValues> };

export function DescriptionField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>توضیحات محصول</FormLabel>
          <FormControl>
            <EditorClient
              value={field.value}
              onChange={field.onChange}
              slug="product-description"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
