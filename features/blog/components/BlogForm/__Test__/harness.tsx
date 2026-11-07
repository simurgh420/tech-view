// features/blog/components/BlogForm/__Test__/harness.tsx
import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodTypeAny } from 'zod';

import { Form } from '@/components/ui/form';

export const baseValues = {
  title: '',
  excerpt: '',
  coverImageUrl: null as unknown,
  content: '',
  tags: [] as string[],
};

/** اسکیمای ساده فقط برای تست اتصال فرم؛ قوانین واقعی در schemas/blog.test.ts تست می‌شوند */
export const testBlogSchema = z.object({
  title: z.string().min(3, 'عنوان کوتاه است'),
  excerpt: z.string().min(5, 'خلاصه کوتاه است'),
  coverImageUrl: z.any(),
  content: z.string().min(1, 'محتوا الزامی است'),
  tags: z.array(z.string()),
});

type Props = {
  defaultValues?: Record<string, unknown>;
  schema?: ZodTypeAny;
  /** فرم ساخته‌شده را بیرون می‌دهد تا تست بتواند getValues / trigger را صدا بزند */
  onForm?: (form: UseFormReturn<any>) => void;
  /** وقتی false است، <Form> دورش نمی‌پیچد (BlogForm خودش دارد) */
  wrap?: boolean;
  children: (form: UseFormReturn<any>) => React.ReactNode;
};

export function FormHarness({ defaultValues, schema, onForm, wrap = true, children }: Props) {
  const form = useForm<any>({
    defaultValues: { ...baseValues, ...defaultValues },
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
  });
  onForm?.(form);

  return wrap ? <Form {...form}>{children(form)}</Form> : <>{children(form)}</>;
}
