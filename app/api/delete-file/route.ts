import { deleteImage } from '@/services/upload/deleteImage';

export async function POST(req: Request) {
  const { imagePath } = await req.json();
  const ok = await deleteImage(imagePath);
  return Response.json({ success: ok });
}
