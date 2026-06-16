'use server';

import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function updateUserAction(formData: FormData) {
  // 2. بررسی احراز هویت
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: لطفاً وارد شوید' };
  }
  const isAdmin = session.user.role === 'ADMIN';
  // 1. استخراج و اعتبارسنجی اولیه داده‌ها
  const name = String(formData.get('name') ?? '');
  const file = formData.get('file') as File | null;
  if (name && (name.length < 2 || name.length > 50)) {
    return { success: false, error: 'نام باید بین ۲ تا ۵۰ کاراکتر باشد' };
  }
  const phone = String(formData.get('phone') ?? '');
  if (file && !isAdmin) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'فرمت فایل مجاز نیست (فقط JPEG, PNG, WEBP)' };
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' };
    }
  }

  let imageUrl: string | undefined;

  if (file) {
    try {
      imageUrl = await uploadImage(
        file,
        'user-avatars',
        `avatar-${session.user.id}` // نام فایل یکتا بر اساس userId
      );
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      return { success: false, error: 'خطا در آپلود تصویر. لطفاً دوباره تلاش کنید' };
    }
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(imageUrl && { image: imageUrl }),
      },
    });
    revalidatePath('/dashboard/settings');

    return { success: true, error: null, imageUrl };
  } catch (err) {
    if (err instanceof APIError) {
      // خطای مربوط به Better Auth (مثلاً ایمیل تکراری – اگر اجازه تغییر ایمیل داشته باشید)
      if (err.status === 400) {
        return { success: false, error: 'اطلاعات ارسالی نامعتبر است (مثلاً ایمیل تکراری)' };
      }
      return { success: false, error: err.message };
    }

    console.error('Update user error:', err);
    return { success: false, error: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید' };
  }
}
