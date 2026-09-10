import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { addMemory } from '@/lib/db';

export const runtime = 'nodejs';

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function extensionFor(type: string) {
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  return '.jpg';
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const relationship = String(form.get('relationship') || '').trim();
    const message = String(form.get('message') || '').trim();

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 });
    }

    const photos = form
      .getAll('photos')
      .filter((item): item is File => item instanceof File && item.size > 0)
      .slice(0, MAX_PHOTOS);

    for (const photo of photos) {
      if (!ALLOWED_TYPES.has(photo.type)) {
        return NextResponse.json({ error: 'Photos must be JPG, PNG, or WebP.' }, { status: 400 });
      }
      if (photo.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Each photo must be 8 MB or smaller.' }, { status: 400 });
      }
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const photoUrls: string[] = [];

    for (const photo of photos) {
      const fileName = `${Date.now()}-${crypto.randomUUID()}${extensionFor(photo.type)}`;
      const bytes = Buffer.from(await photo.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, fileName), bytes);
      photoUrls.push(`/uploads/${fileName}`);
    }

    const id = addMemory({ name, relationship, message, photos: photoUrls });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Could not save the memory.' }, { status: 500 });
  }
}
