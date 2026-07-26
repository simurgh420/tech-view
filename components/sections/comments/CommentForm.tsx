'use client';

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
import { Button } from '@/components/ui/button';
import { useNotify } from '@/hooks/useNotify';
import { CreateCommentInput, createCommentSchema } from '@/lib/validation/comment';
import { StarRatingInput } from '@/components/ui/star-rating-input';
import { useAddComment } from '@/hooks/useComments';

export function CommentForm({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const addCommentMutation = useAddComment(postId);
  const notify = useNotify();

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
      rating: 5,
    },
  });
  function handleSubmit(values: CreateCommentInput) {
    if (!userId) return;
    addCommentMutation.mutate(values, {
      onSuccess: () => {
        notify.success('کامنت با موفقیت ثبت شد ✅');
        form.reset();
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ارسال کامنت ❌';
        notify.error(message);
      },
    });
  }

  if (!userId) {
    return (
      <p className="text-sm text-gray-500 p-5 border rounded-xl">برای ارسال کامنت وارد شوید.</p>
    );
  }

  return (
    <Form {...form}>
      <form
        dir="rtl"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 p-5 border rounded-xl shadow-md"
      >
        <h3 className="text-lg font-bold mb-2">✍️ ارسال کامنت جدید</h3>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">متن کامنت</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="نظر خود را بنویسید..."
                  rows={4}
                  className="text-right leading-7"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex justify-start">
          <Button type="submit" disabled={addCommentMutation.isPending}>
            {addCommentMutation.isPending ? 'در حال ارسال...' : 'ارسال کامنت'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
