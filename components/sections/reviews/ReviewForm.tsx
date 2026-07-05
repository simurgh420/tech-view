// components/sections/reviews/ReviewForm.tsx
'use client';

import { useReviews } from '@/hooks/useReviews';
import { useSession } from '@/lib/auth-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotify } from '@/hooks/useNotify';
import { CreateReviewInput, createReviewSchema } from '@/lib/validation/review';
import { StarRatingInput } from '@/components/ui/star-rating-input';

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { useCreateReview } = useReviews(productSlug);
  const createReview = useCreateReview();
  const notify = useNotify();

  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      productSlug,
      rating: 0,
      title: '',
      content: '',
    },
  });

  function handleSubmit(values: CreateReviewInput) {
    if (!userId) return;
    createReview.mutate(values, {
      onSuccess: () => {
        notify.success('نظر شما با موفقیت ثبت شد ✅');
        form.reset({ productSlug, rating: 0, title: '', content: '' });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ثبت نظر ❌';
        notify.error(message);
      },
    });
  }

  if (!userId) {
    return (
      <p className="rounded-xl border p-5 text-sm text-muted-foreground" dir="rtl">
        برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form
        dir="rtl"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 rounded-xl border p-5 shadow-sm"
      >
        <h3 className="mb-2 text-lg font-bold">✍️ ثبت نظر جدید</h3>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">امتیاز شما</FormLabel>
              <FormControl>
                <StarRatingInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">عنوان (اختیاری)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="خلاصه‌ای از نظر شما" className="text-right" />
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
              <FormLabel className="font-semibold">متن نظر</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="تجربه‌ی خود از این محصول را بنویسید..."
                  rows={4}
                  className="text-right leading-7"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-start">
          <Button type="submit" disabled={createReview.isPending}>
            {createReview.isPending ? 'در حال ثبت...' : 'ثبت نظر'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
