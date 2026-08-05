'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useRouter } from 'next/navigation';

import Image from 'next/image';
import { ImageUploader } from '../image/ImageUploader';

import { useNotify } from '@/hooks/useNotify';
import { updateUserAction } from '@/services/action/user/updateuserAction';
import { deleteUserImageAction } from '@/services/action/user/deleteUserImageAction';

const schema = z
  .object({
    name: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(val => !val || /^09\d{9}$/.test(val), 'شماره موبایل معتبر نیست'),
    file: z
      .any()
      .optional()
      .refine(file => !file?.[0] || file[0] instanceof File, 'فایل انتخاب‌شده معتبر نیست')
      .refine(
        file => !file?.[0] || ['image/jpeg', 'image/png', 'image/webp'].includes(file[0].type),
        'فقط فرمت‌های JPG, PNG, WEBP مجاز هستند'
      ),
  })
  .refine(data => data.name || data.file, {
    message: 'لطفاً نام یا تصویر را وارد کنید',
    path: ['name'],
  });

type FormValues = z.infer<typeof schema>;

interface UpdateUserFormProps {
  name: string;
  image: string;
  phone: string;
}

export const UpdateUserForm = ({ name, image, phone }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(image);
  const router = useRouter();
  const notify = useNotify();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      phone,
      file: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);

    const formData = new FormData();
    if (values.name) formData.append('name', values.name);
    if (values.phone) formData.append('phone', values.phone);
    if (values.file?.[0]) formData.append('file', values.file[0]);

    const { error, imageUrl } = await updateUserAction(formData);

    if (error) {
      notify.error(error);
    } else {
      notify.success('پروفایل با موفقیت به‌روزرسانی شد');
      if (imageUrl) setPreview(imageUrl);
      form.resetField('file');
      router.refresh();
    }

    setIsPending(false);
  }

  async function handleDeleteImage() {
    if (!preview) return;
    setIsPending(true);

    const { error } = await deleteUserImageAction(preview); // ✅ پاس دادن URL تصویر

    if (error) {
      notify.error(error);
    } else {
      notify.success('تصویر پروفایل حذف شد');
      setPreview(null);
      router.refresh();
    }
    setIsPending(false);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-sm w-full space-y-6  p-6 rounded-xl shadow-sm border"
      >
        {/* Preview Image + Delete Button */}
        {preview && (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={preview}
              width={80}
              height={80}
              alt="Profile preview"
              className="rounded-full border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDeleteImage}
            >
              حذف تصویر
            </Button>
          </div>
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">نام</FormLabel>
              <FormControl>
                <Input id="name" placeholder="نام شما" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شماره موبایل</FormLabel>
              <FormControl>
                <Input placeholder="مثال: 09123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تصویر پروفایل</FormLabel>
              <FormControl>
                <ImageUploader
                  initialUrl={image}
                  onChange={file => field.onChange(file ? [file] : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </form>
    </Form>
  );
};
