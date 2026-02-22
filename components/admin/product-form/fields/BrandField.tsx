'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { ProductFormValues } from '../product.schema';

type Brand = { slug: string; name: string };

type Props = { control: Control<ProductFormValues>; brands: Brand[] };

export function BrandField({ control, brands }: Props) {
  return (
    <FormField
      control={control}
      name="brandSlug"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="brandSlug">برند</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange} disabled={!brands.length}>
              <SelectTrigger id="brandSlug">
                <SelectValue placeholder="انتخاب برند" />
              </SelectTrigger>
              <SelectContent>
                {brands.length === 0 ? (
                  <SelectItem disabled value="__empty">
                    هیچ برندی ثبت نشده
                  </SelectItem>
                ) : (
                  brands.map(brand => (
                    <SelectItem key={brand.slug} value={brand.slug}>
                      {brand.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
