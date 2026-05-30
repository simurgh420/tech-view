'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BlogFormType } from '@/lib/validation/blog';
import { Control } from 'react-hook-form';

export function BlogTitleSection({ control }: { control: Control<BlogFormType> }) {
  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>عنوان</FormLabel>
          <FormControl>
            <Input
              className="text-right"
              placeholder="مثلاً: تجربه من با هدفون‌های استریو"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
