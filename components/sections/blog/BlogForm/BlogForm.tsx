'use client';

import { UseFormReturn, useWatch } from 'react-hook-form';

import { Form } from '@/components/ui/form';

import { BlogTitleSection } from './BlogTitleSection';
import { BlogExcerptSection } from './BlogExcerptSection';
import { BlogCoverSection } from './BlogCoverSection';
import { BlogContentSection } from './BlogContentSection';
import { BlogTagsSection } from './BlogTagsSection';
import { Button } from '@/components/ui';
import { BlogFormType } from '@/lib/validation/blog';
import { toSlug } from '@/lib/slug-common';

type Props = {
  form: UseFormReturn<BlogFormType>;
  initialValues?: {
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    content: string;
    tags: string[];
  };
  onSubmit: (data: BlogFormType) => void;
  isLoading?: boolean;
};
export function BlogForm({ form, initialValues, onSubmit, isLoading }: Props) {
  const title = useWatch({ control: form.control, name: 'title' });
  const slug = toSlug(title || '');
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" dir="rtl">
        <BlogTitleSection control={form.control} />
        <BlogExcerptSection control={form.control} />
        <BlogCoverSection
          control={form.control}
          initialUrl={initialValues?.coverImageUrl ?? null}
        />
        <BlogContentSection control={form.control} slug={slug} />
        <BlogTagsSection control={form.control} />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره...' : initialValues ? 'ویرایش بلاگ' : 'ثبت بلاگ'}
        </Button>
      </form>
    </Form>
  );
}
