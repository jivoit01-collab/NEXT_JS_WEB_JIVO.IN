import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants';
import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Force Node runtime (sharp + fs are not edge-compatible)
export const runtime = 'nodejs';

/** Root-level uploads directory (outside /public) */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');

function sanitizeFilename(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
}

// ── POST /api/upload ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max size: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed. Accepted: JPEG, PNG, WebP' },
        { status: 400 },
      );
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

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    await writeFile(filePath, webpBuffer);

    // Return ONLY the filename — frontend constructs /api/uploads/<filename>
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
      { success: false, error: 'Upload failed' },
      { status: 500 },
    );
  }
}

// ── DELETE /api/upload ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { filename } = (await req.json()) as { filename?: string };

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 },
      );
    }

    // Prevent directory traversal — filename must be a bare name, no slashes
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 },
      );
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 },
      );
    }

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[upload] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 },
    );
  }
}
