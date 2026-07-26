// components/sections/product-comments/ProductCommentForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { useNotify } from '@/hooks/useNotify';
import { useSession } from '@/lib/auth-client';

import {
  CreateProductCommentInput,
  createProductCommentSchema,
} from '@/lib/validation/productComment';
import { useCreateComment } from '@/hooks/useProductComments';

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

  if (!userId) {
    return (
      <p
        dir="rtl"
        className="
          rounded-xl
          border
          p-4

          text-sm
          text-muted-foreground
        "
      >
        برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید.
      </p>
    );
  }

  return (
    <AuthenticatedCommentForm
      productSlug={productSlug}
      parentId={parentId}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

function AuthenticatedCommentForm({
  productSlug,
  parentId,
  placeholder,
  autoFocus,
  onSuccess,
  onCancel,
}: ProductCommentFormProps) {
  const createComment = useCreateComment(productSlug);

  const notify = useNotify();

  const form = useForm<CreateProductCommentInput>({
    resolver: zodResolver(createProductCommentSchema),

    defaultValues: {
      productSlug,
      content: '',
      parentId,
    },
  });

  function handleSubmit(values: CreateProductCommentInput) {
    createComment.mutate(values, {
      onSuccess: () => {
        notify.success(parentId ? 'پاسخ شما ثبت شد ✅' : 'دیدگاه شما ثبت شد ✅');

        form.reset({
          productSlug,
          content: '',
          parentId,
        });

        onSuccess?.();
      },

      onError: error => {
        notify.error(error instanceof Error ? error.message : 'خطا در ثبت دیدگاه ❌');
      },
    });
  }

  return (
    <Form {...form}>
      <form
        dir="rtl"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="
          space-y-3
        "
      >
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
                  disabled={createComment.isPending}
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
            gap-2
          "
        >
          <Button
            type="submit"
            size={parentId ? 'sm' : 'default'}
            disabled={createComment.isPending}
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
    duration-300

    hover:-translate-y-0.5

    disabled:translate-y-0
    disabled:opacity-50
  "
          >
            {createComment.isPending ? 'در حال ارسال...' : parentId ? 'ارسال پاسخ' : 'ثبت دیدگاه'}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={createComment.isPending}
            >
              انصراف
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
