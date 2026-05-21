import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_UPLOAD_SIZE,
  MAX_VIDEO_UPLOAD_SIZE,
} from '@/lib/constants';
import sharp from 'sharp';
import path from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream as WebReadableStream } from 'stream/web';

// Force Node runtime (sharp + fs are not edge-compatible)
export const runtime = 'nodejs';

/** Root-level uploads directory (outside /public) */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const MAX_IMAGE_DIMENSION = 3200;
const IMAGE_WEBP_QUALITY = 95;

function sanitizeFilename(name: string, fallback = 'media'): string {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || fallback
  );
}

function getSafeExtension(name: string, type: string) {
  const ext = path.extname(name).toLowerCase();
  if (type === 'video/mp4') return '.mp4';
  if (type === 'video/webm') return '.webm';
  if (type === 'video/ogg') return ext === '.ogv' ? '.ogv' : '.ogg';
  return ext;
}

// POST /api/upload
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxAllowedSize = isVideo ? MAX_VIDEO_UPLOAD_SIZE : MAX_UPLOAD_SIZE;

    if (file.size > maxAllowedSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max size: ${maxAllowedSize / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: 'File type not allowed. Accepted: JPEG, PNG, WebP, MP4, WebM, OGG',
        },
        { status: 400 },
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    if (isVideo) {
      const safeName = sanitizeFilename(file.name, 'video');
      const filename = `${Date.now()}-${safeName}${getSafeExtension(file.name, file.type)}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      // Stream large videos to disk instead of creating an extra 300-400MB Buffer copy in memory.
      await pipeline(
        Readable.fromWeb(file.stream() as unknown as WebReadableStream<Uint8Array>),
        createWriteStream(filePath),
      );

      return NextResponse.json({
        success: true,
        data: {
          filename,
          originalName: file.name,
          size: file.size,
          width: 0,
          height: 0,
        },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Preserve enough pixels for full-bleed lg/2xl sections while still emitting optimized WebP.
    const webpBuffer = await sharp(buffer)
      .rotate()
      .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer();

    const metadata = await sharp(webpBuffer).metadata();

    const safeName = sanitizeFilename(file.name);
    const filename = `${Date.now()}-${safeName}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await writeFile(filePath, webpBuffer);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        originalName: file.name,
        size: webpBuffer.length,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
      },
    });
  } catch (error) {
    console.error('[upload] POST error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE /api/upload
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { filename } = (await req.json()) as { filename?: string };

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
    }

    // Prevent directory traversal - filename must be a bare name, no slashes.
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[upload] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
