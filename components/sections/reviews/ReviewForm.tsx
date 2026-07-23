// components/sections/reviews/ReviewForm.tsx

'use client';

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

import { StarRatingInput } from '@/components/ui/star-rating-input';

import { useReviews } from '@/hooks/useReviews';
import { useNotify } from '@/hooks/useNotify';

import { useSession } from '@/lib/auth-client';

import { CreateReviewInput, createReviewSchema } from '@/lib/validation/review';

type Props = {
  productSlug: string;
};

export function ReviewForm({ productSlug }: Props) {
  const { data: session } = useSession();

  const userId = session?.user?.id;

  if (!userId) {
    return (
      <p
        dir="rtl"
        className="
          rounded-xl
          border
          p-5

          text-sm
          text-muted-foreground
        "
      >
        برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.
      </p>
    );
  }

  return <AuthenticatedReviewForm productSlug={productSlug} />;
}

function AuthenticatedReviewForm({ productSlug }: Props) {
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
    createReview.mutate(values, {
      onSuccess: () => {
        notify.success('نظر شما با موفقیت ثبت شد ✅');

        form.reset({
          productSlug,
          rating: 0,
          title: '',
          content: '',
        });
      },

      onError: error => {
        notify.error(error instanceof Error ? error.message : 'خطا در ثبت نظر ❌');
      },
    });
  }

  const isPending = createReview.isPending;

  return (
    <Form {...form}>
      <form
        dir="rtl"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="
          space-y-5

          rounded-xl

          border

          p-5

          shadow-sm

          bg-background
        "
      >
        <h3
          className="
            text-lg
            font-bold
          "
        >
          ✍️ ثبت نظر جدید
        </h3>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">امتیاز شما</FormLabel>

              <FormControl>
                <StarRatingInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
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
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="خلاصه‌ای از نظر شما"
                  className="text-right"
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
              <FormLabel className="font-semibold">متن نظر</FormLabel>

              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="تجربه‌ی خود از این محصول را بنویسید..."
                  rows={4}
                  className="
                    text-right
                    leading-7
                  "
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className="
            flex
            justify-start
          "
        >
          <Button
            type="submit"
            disabled={isPending}
            className="
              bg-linear-to-r

              from-blue-600
              to-indigo-600

              text-white

              hover:from-blue-700
              hover:to-indigo-700

              shadow-md
              shadow-blue-500/20

              transition-all
            "
          >
            {isPending ? 'در حال ثبت...' : 'ثبت نظر'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
