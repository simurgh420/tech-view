'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { BrandActions } from './BrandActions';

const brandSchema = z.object({
  name: z.string().min(2, 'نام برند الزامی است'),
  logo: z.url('آدرس لوگو باید معتبر باشد').optional(),
});

export type BrandFormType = z.infer<typeof brandSchema>;

export function BrandForm({
  initialValues,
  onSubmit,
  isLoading,
  slug,
}: {
  initialValues?: Partial<BrandFormType>;
  onSubmit: (data: BrandFormType) => void;
  isLoading?: boolean;
  slug?: string;
}) {
  const form = useForm<BrandFormType>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      logo: initialValues?.logo ?? '',
    },
  });

  return (
    <Card className="max-w-md mx-auto shadow-lg border rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          {initialValues ? 'ویرایش برند' : 'ایجاد برند جدید'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام برند</FormLabel>
                  <FormControl>
                    <Input placeholder="مثلاً: Samsung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>لوگو (اختیاری)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://brandfetch.com/" {...field} />
                  </FormControl>
                  {field.value && (
                    <div className="mt-2 flex justify-center">
                      <Image
                        src={field.value}
                        alt="لوگوی برند"
                        width={120}
                        height={120}
                        className="object-contain rounded-md shadow"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {slug && <BrandActions slug={slug} />}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'در حال ذخیره...' : initialValues ? 'ویرایش' : 'ثبت'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
