'use client';

import { useComments } from '@/hooks/useComments';
import { useSession } from '@/lib/auth-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const commentSchema = z.object({
  content: z.string().min(3, 'متن کامنت خیلی کوتاه است'),
  rating: z.number().min(1).max(5),
});

type CommentFormType = z.infer<typeof commentSchema>;

export function CommentForm({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { addComment } = useComments(postId);

  const form = useForm<CommentFormType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      rating: 5,
    },
  });

  function handleSubmit(values: CommentFormType) {
    if (!userId) return; // کاربر لاگین نیست

    addComment.mutate(
      {
        authorId: userId,
        content: values.content,
        rating: values.rating,
      },
      {
        onSuccess: () => form.reset(),
      }
    );
  }

  return (
    <Form {...form}>
      <form
        dir="rtl"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 p-5 border rounded-xl bg-white shadow-md"
      >
        <h3 className="text-lg font-bold mb-2">✍️ ارسال کامنت جدید</h3>

        {addComment.error && (
          <p className="text-red-600 text-sm">
            خطا در ارسال کامنت: {(addComment.error as Error).message}
          </p>
        )}

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
              <FormLabel className="font-semibold">امتیاز (۱ تا ۵)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...field}
                  onChange={e => field.onChange(+e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-start">
          <Button
            type="submit"
            disabled={addComment.isPending || !userId}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addComment.isPending ? 'در حال ارسال...' : 'ارسال کامنت'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
