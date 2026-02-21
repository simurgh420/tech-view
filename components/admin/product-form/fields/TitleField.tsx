'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Props = { control: Control<ProductFormValues> };

export function TitleField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>عنوان محصول</FormLabel>
          <FormControl>
            <Input className="text-right" placeholder="مثلاً: گوشی موبایل سامسونگ A36" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
