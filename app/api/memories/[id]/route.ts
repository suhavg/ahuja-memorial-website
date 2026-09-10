import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { deleteMemory, getPhotoUrlsForMemory } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export const runtime = 'nodejs';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid memory id.' }, { status: 400 });
  }

  const photoUrls = getPhotoUrlsForMemory(id);
  deleteMemory(id);

  for (const url of photoUrls) {
    if (!url.startsWith('/uploads/')) continue;
    const fileName = path.basename(url);
    try {
      await fs.unlink(path.join(process.cwd(), 'public', 'uploads', fileName));
    } catch {
      // Ignore a missing image file; the database entry is already deleted.
    }
  }

  return NextResponse.json({ success: true });
}
