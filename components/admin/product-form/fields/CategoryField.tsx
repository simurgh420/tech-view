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

type Category = { slug: string; title: string };

type Props = { control: Control<ProductFormValues>; categories: Category[] };

export function CategoryField({ control, categories }: Props) {
  return (
    <FormField
      control={control}
      name="categorySlug"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="categorySlug">دسته‌بندی</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!categories.length}
            >
              <SelectTrigger id="categorySlug">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem disabled value="__empty">
                    هیچ دسته‌بندی ثبت نشده
                  </SelectItem>
                ) : (
                  categories.map(category => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.title}
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
