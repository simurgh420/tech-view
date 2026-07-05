// components/sections/product-comments/ProductCommentForm.tsx
'use client';

import { useProductComments } from '@/hooks/useProductComments';
import { useSession } from '@/lib/auth-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNotify } from '@/hooks/useNotify';
import {
  CreateProductCommentInput,
  createProductCommentSchema,
} from '@/lib/validation/productComment';

interface ProductCommentFormProps {
  productSlug: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductCommentForm({
  productSlug,
  parentId,
  placeholder = 'دیدگاه خود را بنویسید...',
  autoFocus,
  onSuccess,
  onCancel,
}: ProductCommentFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { useCreateComment } = useProductComments(productSlug);
  const createComment = useCreateComment();
  const notify = useNotify();

  const form = useForm<CreateProductCommentInput>({
    resolver: zodResolver(createProductCommentSchema),
    defaultValues: { productSlug, content: '', parentId },
  });

  function handleSubmit(values: CreateProductCommentInput) {
    if (!userId) return;
    createComment.mutate(values, {
      onSuccess: () => {
        notify.success(parentId ? 'پاسخ شما ثبت شد ✅' : 'دیدگاه شما ثبت شد ✅');
        form.reset({ productSlug, content: '', parentId });
        onSuccess?.();
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || 'خطا در ثبت دیدگاه ❌';
        notify.error(message);
      },
    });
  }

  if (!userId) {
    return (
      <p className="rounded-xl border p-4 text-sm text-muted-foreground" dir="rtl">
        برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form dir="rtl" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  rows={parentId ? 2 : 3}
                  autoFocus={autoFocus}
                  className="text-right leading-7"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            size={parentId ? 'sm' : 'default'}
            disabled={createComment.isPending}
          >
            {createComment.isPending ? 'در حال ارسال...' : parentId ? 'ارسال پاسخ' : 'ثبت دیدگاه'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              انصراف
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
