///app/api/images/delete/route.ts
import { deleteImage } from '@/services/upload/deleteImage';

export async function POST(req: Request) {
  try {
    const { imagePath } = await req.json();
    const ok = await deleteImage(imagePath);
    return Response.json({ success: ok });
  } catch (err) {
    console.error('API delete-image error:', err);
    return Response.json({ success: false }, { status: 500 });
  }
}
