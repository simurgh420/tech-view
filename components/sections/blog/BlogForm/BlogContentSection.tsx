'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import EditorClient from '@/components/editors/EditorClient';
import { Control } from 'react-hook-form';
import { BlogFormType } from '@/lib/validation/blog';

export function BlogContentSection({
  control,
  slug,
}: {
  control: Control<BlogFormType>;
  slug: string;
}) {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>محتوا</FormLabel>
          <FormControl>
            <EditorClient value={field.value} onChange={field.onChange} slug={slug} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
