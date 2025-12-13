'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import axios from 'axios';
import RichTextEditor from '@/components/editors/RichTextEditor';
const schema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  excerpt: z.string().min(10, 'خلاصه باید حداقل ۱۰ کاراکتر باشد'),
  coverImageUrl: z.url('آدرس تصویر معتبر نیست'),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  author: z.string().min(3, 'نام نویسنده باید حداقل ۳ کاراکتر باشد'),
});
type BlogForm = z.infer<typeof schema>;

export function BlogForm() {
  const form = useForm<BlogForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      excerpt: '',
      coverImageUrl: '',
      content: '',
      author: '',
    },
  });
  const router = useRouter();
  const onSubmit = async (data: BlogForm) => {
    await axios.post(`/api/blog`, data);
    router.push('/blog');
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormLabel>آدرس تصویر کاور</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
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
                {/* TipTap only on client */}
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
        <Button type="submit">ثبت بلاگ</Button>
      </form>
    </Form>
  );
}
