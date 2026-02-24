'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import z from 'zod';

import { Form } from '@/components/ui/form';

import { toSlug } from '@/lib/slug';
import { BlogTitleSection } from './BlogTitleSection';
import { BlogExcerptSection } from './BlogExcerptSection';
import { BlogCoverSection } from './BlogCoverSection';
import { BlogContentSection } from './BlogContentSection';
import { BlogTagsSection } from './BlogTagsSection';
import { Button } from '@/components/ui';

const schema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه باید حداقل ۱۰ کاراکتر باشد'),
  coverImageUrl: z.union([z.instanceof(File), z.string()]).optional(),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  tags: z.array(z.string().min(2, 'تگ باید حداقل ۲ کاراکتر باشد')),
});

export type BlogFormType = z.infer<typeof schema>;

type Props = {
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
export function BlogForm({ initialValues, onSubmit, isLoading }: Props) {
  const form = useForm<BlogFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? '',
      excerpt: initialValues?.excerpt ?? '',
      coverImageUrl: undefined,
      content: initialValues?.content ?? '',
      tags: initialValues?.tags ?? [],
    },
  });
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
