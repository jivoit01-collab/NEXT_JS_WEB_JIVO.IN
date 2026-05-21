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
import { writeFile, mkdir, unlink } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

// Force Node runtime (sharp + fs are not edge-compatible)
export const runtime = 'nodejs';

/** Root-level uploads directory (outside /public) */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const MULTIPART_UPLOAD_OVERHEAD_BYTES = 20 * 1024 * 1024;
const MAX_MULTIPART_UPLOAD_SIZE = MAX_VIDEO_UPLOAD_SIZE + MULTIPART_UPLOAD_OVERHEAD_BYTES;

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

function getContentLength(req: NextRequest) {
  const rawContentLength = req.headers.get('content-length');
  if (!rawContentLength) return null;

  const contentLength = Number(rawContentLength);
  return Number.isFinite(contentLength) ? contentLength : null;
}

function tooLargeResponse(maxBytes = MAX_VIDEO_UPLOAD_SIZE) {
  return NextResponse.json(
    {
      success: false,
      error: `File too large. Max video size: ${Math.floor(maxBytes / 1024 / 1024)}MB`,
    },
    { status: 413 },
  );
}

async function saveVideoFile(file: File, filePath: string) {
  // Stream the uploaded video to disk instead of creating another 400MB Buffer.
  // Next still has to parse multipart data, but this avoids doubling memory use
  // inside the route handler and keeps large uploads much steadier.
  const source = Readable.fromWeb(
    file.stream() as unknown as Parameters<typeof Readable.fromWeb>[0],
  );

  await pipeline(source, createWriteStream(filePath));
}

// POST /api/upload
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const contentLength = getContentLength(req);
  if (contentLength !== null && contentLength > MAX_MULTIPART_UPLOAD_SIZE) {
    return tooLargeResponse();
  }

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
      return tooLargeResponse(maxAllowedSize);
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

      await saveVideoFile(file, filePath);

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

    // Sharp: resize + re-encode to WebP (also strips EXIF for privacy)
    const webpBuffer = await sharp(buffer)
      .rotate() // honor EXIF orientation
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 100 })
      .toBuffer();

    const metadata = await sharp(webpBuffer).metadata();

    const safeName = sanitizeFilename(file.name);
    const filename = `${Date.now()}-${safeName}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await writeFile(filePath, webpBuffer);

    // Return ONLY the filename - frontend constructs /api/uploads/<filename>
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

    return NextResponse.json(
      {
        success: false,
        error:
          'Upload failed. If this was a large video, restart the dev server after the 400MB proxy limit change.',
      },
      { status: 500 },
    );
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

    // Prevent directory traversal - filename must be a bare name, no slashes
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    if (!existsSync(filePath)) {
      // Admin screens may retry/delete an already replaced media file. Treat a
      // missing file as idempotent success so UI replacement flows do not break.
      return NextResponse.json({ success: true, skipped: true });
    }

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[upload] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
