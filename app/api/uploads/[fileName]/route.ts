import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getUploadDir, isSafeUploadFileName } from '@/lib/storage';

export const runtime = 'nodejs';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(_request: Request, { params }: { params: { fileName: string } }) {
  const fileName = params.fileName;
  if (!isSafeUploadFileName(fileName)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const image = await fs.readFile(path.join(getUploadDir(), fileName));
    return new NextResponse(image, {
      headers: {
        'Content-Type': CONTENT_TYPES[path.extname(fileName).toLowerCase()] || 'application/octet-stream',
        // An uploaded filename is unique, so it is safe to cache without serving stale replacements.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse(null, { status: 404 });
    }
    console.error('Could not read uploaded image:', error);
    return new NextResponse(null, { status: 500 });
  }
}
