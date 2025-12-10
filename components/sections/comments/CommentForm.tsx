'use client';

import { useComments } from '@/hooks/useComments';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const commentSchema = z.object({
  author: z.string().min(2, 'نام باید حداقل ۲ حرف باشد'),
  content: z.string().min(3, 'متن کامنت خیلی کوتاه است'),
  rating: z.number().min(1).max(5), // ✅ تبدیل خودکار به number
});

type CommentFormType = z.infer<typeof commentSchema>;

export function CommentForm({ postId }: { postId: string }) {
  const { addComment } = useComments(postId);

  const form = useForm<CommentFormType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      author: '',
      content: '',
      rating: 5,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values =>
          addComment.mutate(values, { onSuccess: () => form.reset() })
        )}
        className="space-y-5 p-5 border rounded-xl bg-white shadow-md"
      >
        <h3 className="text-lg font-bold">✍️ ارسال کامنت جدید</h3>

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام شما</FormLabel>
              <FormControl>
                <Input {...field} placeholder="نام شما..." />
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
              <FormLabel>متن کامنت</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="نظر خود را بنویسید..." rows={4} />
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
              <FormLabel>امتیاز (۱ تا ۵)</FormLabel>
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={addComment.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addComment.isPending ? 'در حال ارسال...' : 'ارسال کامنت'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
