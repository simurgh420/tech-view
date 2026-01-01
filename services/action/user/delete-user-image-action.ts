// services/action/user/delete-user-image-action.ts
'use server';

import { deleteImage } from '@/services/upload/deleteImage';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth';

export async function deleteUserImageAction(imageUrl: string) {
  try {
    const imagePath = new URL(imageUrl, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      .pathname;
    await deleteImage(imagePath);

    const session = await auth.api.getSession({ headers: await headers() });
    const currentName = session?.user?.name ?? '';

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: currentName,
        image: null,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'خطای داخلی سرور' };
  }
}
