'use server';

import { auth } from '@/lib/auth';
import { uploadImage } from '@/services/upload/uploadImage';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

export async function updateUserAction(formData: FormData) {
  const name = String(formData.get('name') ?? '');
  const file = formData.get('file') as File | null;

  try {
    let imageUrl: string | undefined;

    if (file) {
      // آپلود فایل در پوشه user-avatars
      imageUrl = await uploadImage(file, 'user-avatars');
    }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        ...(name && { name }),
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return { error: null, imageUrl };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    return { error: 'خطای داخلی سرور' };
  }
}
