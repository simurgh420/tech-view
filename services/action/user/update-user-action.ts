'use server';

import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

export async function updateUserAction(formData: FormData) {
  const name = String(formData.get('name') ?? '');
  const file = formData.get('file') as File | null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    let imageUrl: string | undefined;

    if (file) {
      // 🔥 ساخت نام فایل بر اساس userId
      imageUrl = await uploadImage(file, 'user-avatars', `avatar-${session.user.id}`);
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        ...(name && { name }),
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return { success: true, error: null, imageUrl };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
