'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ProductFormType } from '@/lib/validation/product';

type Props = { control: Control<ProductFormType> };

export function TitleField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="title">عنوان محصول</FormLabel>
          <FormControl>
            <Input id="title" placeholder="مثلاً: گوشی موبایل سامسونگ A36" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
