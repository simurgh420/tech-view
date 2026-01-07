'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { useContact } from '@/hooks/useContact';
import { toast } from 'sonner';
import { ContactFormValues, contactSchema } from '@/lib/validation/contact.';

export function ContactForm() {
  const { useCreateContact } = useContact();
  const createContact = useCreateContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    createContact.mutate(data, {
      onSuccess: () => {
        form.reset();
        toast.success('پیام شما با موفقیت ارسال شد.');
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'خطایی در ارسال پیام رخ داد.');
      },
    });
  };

  return (
    <section className="p-8 rounded-2xl border border-white/10 bg-[oklch(18%_0.01_270)] mb-12 text-right [direction:rtl]">
      <h2 className="text-xl font-semibold text-[oklch(95%_0.01_270)] mb-6">فرم تماس با ما</h2>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* نام */}
        <div className="flex flex-col gap-1">
          <Input
            {...form.register('name')}
            placeholder="نام و نام خانوادگی"
            disabled={createContact.isPending}
            className="
              w-full bg-[oklch(20%_0.01_270)] border border-white/10 
              rounded-xl px-4 py-3 text-[oklch(90%_0.01_270)]
              focus-visible:ring-0 focus-visible:border-[oklch(60%_0.15_270)]
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.name && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* ایمیل */}
        <div className="flex flex-col gap-1">
          <Input
            {...form.register('email')}
            placeholder="ایمیل"
            disabled={createContact.isPending}
            className="
              w-full bg-[oklch(20%_0.01_270)] border border-white/10 
              rounded-xl px-4 py-3 text-[oklch(90%_0.01_270)]
              focus-visible:ring-0 focus-visible:border-[oklch(60%_0.15_270)]
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.email && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* شماره تماس */}
        <div className="flex flex-col gap-1">
          <Input
            {...form.register('phone')}
            placeholder="شماره تماس"
            disabled={createContact.isPending}
            className="
              w-full bg-[oklch(20%_0.01_270)] border border-white/10 
              rounded-xl px-4 py-3 text-[oklch(90%_0.01_270)]
              focus-visible:ring-0 focus-visible:border-[oklch(60%_0.15_270)]
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.phone && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.phone.message}</p>
          )}
        </div>

        {/* موضوع پیام */}
        <div className="flex flex-col gap-1">
          <Input
            {...form.register('subject')}
            placeholder="موضوع پیام"
            disabled={createContact.isPending}
            className="
              w-full bg-[oklch(20%_0.01_270)] border border-white/10 
              rounded-xl px-4 py-3 text-[oklch(90%_0.01_270)]
              focus-visible:ring-0 focus-visible:border-[oklch(60%_0.15_270)]
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.subject && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.subject.message}</p>
          )}
        </div>

        {/* متن پیام */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <Textarea
            {...form.register('message')}
            placeholder="متن پیام شما..."
            disabled={createContact.isPending}
            className="
              h-32 w-full bg-[oklch(20%_0.01_270)] border border-white/10 
              rounded-xl px-4 py-3 text-[oklch(90%_0.01_270)]
              focus-visible:ring-0 focus-visible:border-[oklch(60%_0.15_270)]
              transition disabled:opacity-50
            "
          />
          {form.formState.errors.message && (
            <p className="text-red-400 text-xs pr-1">{form.formState.errors.message.message}</p>
          )}
        </div>

        {/* دکمه ارسال */}
        <Button
          type="submit"
          disabled={createContact.isPending}
          className="
            md:col-span-2 mt-4 py-3 rounded-xl 
            bg-[oklch(60%_0.15_270)] text-black font-semibold
            hover:bg-[oklch(65%_0.15_270)] transition disabled:opacity-50
          "
        >
          {createContact.isPending ? 'در حال ارسال...' : 'ارسال پیام'}
        </Button>
      </form>
    </section>
  );
}
