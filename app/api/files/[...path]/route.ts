import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsRoot, ...segments);

  // امنیت: جلوگیری از خروج از پوشه uploads (path traversal)
  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
