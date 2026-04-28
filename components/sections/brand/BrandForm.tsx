'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import z from 'zod';
import {
  CreateBrandInput,
  createBrandSchema,
  EditBrandInput,
  editBrandSchema,
} from '@/lib/validation/brand';
import { BrandFormProps } from '@/types/brand';

export function BrandForm(props: BrandFormProps) {
  const { mode, initialValues, onSubmit, isLoading, slug } = props;

  const schema = mode === 'create' ? createBrandSchema : editBrandSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      logo: initialValues?.logo ?? '',
      isActive: initialValues?.isActive ?? (mode === 'create' ? true : undefined),
    },
  });

  const handleFormSubmit = (data: FormData) => {
    if (mode === 'edit') {
      const payload: EditBrandInput = {
        ...data,
        logo: data.logo === '' ? undefined : data.logo,
      };
      (onSubmit as (data: EditBrandInput) => void)(payload);
    } else {
      onSubmit(data as CreateBrandInput);
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg border rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          {mode === 'edit' ? 'ویرایش برند' : 'ایجاد برند جدید'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
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
                    <Input
                      placeholder="https://brandfetch.com/"
                      {...field}
                      value={field.value ?? ''}
                    />
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
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-5 mb-6">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormLabel>فعال</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {slug && <BrandActions slug={slug} />}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'در حال ذخیره...' : mode === 'edit' ? 'ویرایش' : 'ثبت'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
