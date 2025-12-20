'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/editors/RichTextEditor';
import { TagsInput } from '@/components/Tags/TagsInput';
import { ImageUploader } from '../image/ImageUploader';
const schema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه باید حداقل ۱۰ کاراکتر باشد'),
  coverImageUrl: z.union([z.instanceof(File), z.string()]).optional(),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  author: z.string().min(3, 'نام نویسنده باید حداقل ۳ کاراکتر باشد'),
  tags: z.array(z.string().min(2, 'تگ باید حداقل ۲ کاراکتر باشد')),
});
export type BlogFormType = z.infer<typeof schema>;
type Props = {
  initialValues?: {
    title: string;
    excerpt: string;
    coverImageUrl?: string;
    content: string;
    author: string;
    tags: string[];
  };
  onSubmit: (data: BlogFormType) => void; // دیگه Promise لازم نیست، چون React Query خودش مدیریت می‌کنه
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
      author: initialValues?.author ?? '',
      tags: initialValues?.tags ?? [],
    },
  });

  return (
    <Form {...form}>
      <form data-testid="blog-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="title-form-item">عنوان</FormLabel>
              <FormControl>
                <Input placeholder="مثلاً: تجربه من با هدفون‌های استریو" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>خلاصه</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="یک توضیح کوتاه درباره بلاگ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر کاور</FormLabel>
              <FormControl>
                <ImageUploader
                  initialUrl={initialValues?.coverImageUrl}
                  onChange={file => field.onChange(file)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوا</FormLabel>
              <FormControl>
                {/* TipTap */}
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نویسنده</FormLabel>
              <FormControl>
                <Input placeholder="نام نویسنده" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
        {/* دکمه ارسال */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'در حال ذخیره...' : initialValues?.title ? 'ویرایش بلاگ' : 'ثبت بلاگ'}
        </Button>
      </form>
    </Form>
  );
}
//
