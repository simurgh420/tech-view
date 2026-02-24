'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { BlogFormType } from './BlogForm';

export function BlogExcerptSection({ control }: { control: Control<BlogFormType> }) {
  return (
    <FormField
      control={control}
      name="excerpt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>خلاصه</FormLabel>
          <FormControl>
            <Textarea
              className="text-right"
              rows={3}
              placeholder="یک توضیح کوتاه درباره بلاگ..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
