//app/api/upload/route.ts
import { uploadImage } from '@/services/upload/uploadImage';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;
  const folder = form.get('folder') as string;
  const baseName = form.get('baseName') as string | null;
  const imageUrl = await uploadImage(file, folder, baseName || undefined);

  return Response.json({ imageUrl });
}
