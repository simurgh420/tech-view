'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';
type Props = { control: Control<ProductFormValues> };

export function DescriptionField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>توضیحات</FormLabel>
          <FormControl>
            <Textarea
              className="text-right"
              rows={4}
              placeholder="توضیحات کامل محصول..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
