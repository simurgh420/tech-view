'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { TagsInput } from '@/components/Tags/TagsInput';
import { Control } from 'react-hook-form';
import { BlogFormType } from '@/lib/validation/blog';

export function BlogTagsSection({ control }: { control: Control<BlogFormType> }) {
  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>تگ‌ها</FormLabel>
          <FormControl>
            <TagsInput value={field.value || []} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
