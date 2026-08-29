import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { countFileReferences } from '@/lib/uploads-usage';
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

/**
 * Cross-origin allowlist for uploads.
 *
 * This lets a developer run the admin LOCALLY while uploading to THIS server's
 * disk (see lib/upload-endpoint.ts). It is OFF unless UPLOAD_ALLOWED_ORIGINS is
 * set — a comma-separated list of exact origins permitted to POST/DELETE here,
 * e.g. "http://localhost:3000". The route is still admin-only (requireAdmin),
 * so this only widens WHERE an already-authenticated admin request may come
 * from; it never bypasses auth.
 */
const ALLOWED_ORIGINS = (process.env.UPLOAD_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

/**
 * Optional shared secret that authorizes an upload WITHOUT a browser session.
 *
 * Set UPLOAD_API_KEY on the server AND on the machine running the admin. When a
 * request carries a matching `x-upload-key` header, it is treated as admin — so
 * a locally-run admin can upload to this server's disk without logging into this
 * origin in the browser (which the site's SameSite=Lax cookie would block).
 *
 * Empty by default → this bypass is OFF; only a real admin session is accepted.
 * The key never appears client-side in the public site; it is only sent by the
 * admin upload calls when NEXT_PUBLIC_UPLOAD_KEY is set in that admin's env.
 */
const UPLOAD_API_KEY = process.env.UPLOAD_API_KEY?.trim() ?? '';

/**
 * Constant-time-ish compare to avoid leaking length/prefix via early return.
 * (Both are short config strings; this is a light hardening, not a crypto path.)
 */
function keyMatches(provided: string | null): boolean {
  if (!UPLOAD_API_KEY || !provided) return false;
  if (provided.length !== UPLOAD_API_KEY.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ UPLOAD_API_KEY.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Authorize an upload/delete: accept EITHER a matching upload key OR a normal
 * admin session. Returns null when allowed, or a 401/403 response otherwise.
 */
async function guardUpload(req: NextRequest): Promise<NextResponse | null> {
  if (keyMatches(req.headers.get('x-upload-key'))) return null;
  return requireAdmin();
}

/** If the request's Origin is allow-listed, the CORS headers to echo back. */
function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin')?.replace(/\/$/, '') ?? '';
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    // Credentials (the admin auth cookie) must be allowed for the request to authorize.
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    // Allow the custom auth header on cross-origin requests.
    'Access-Control-Allow-Headers': 'Content-Type, x-upload-key',
    Vary: 'Origin',
  };
}

// Preflight for cross-origin uploads/deletes from an allow-listed dev origin.
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

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

/** Merge the allow-listed CORS headers onto a response before returning it, so
 *  a cross-origin (local-admin → live-server) upload is accepted by the browser. */
function withCors(res: NextResponse, req: NextRequest): NextResponse {
  for (const [k, v] of Object.entries(corsHeaders(req))) res.headers.set(k, v);
  return res;
}

// POST /api/upload — thin wrapper adds CORS to the handler's response.
export async function POST(req: NextRequest) {
  return withCors(await handlePost(req), req);
}

async function handlePost(req: NextRequest) {
  const guard = await guardUpload(req);
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

// DELETE /api/upload — thin wrapper adds CORS to the handler's response.
export async function DELETE(req: NextRequest) {
  return withCors(await handleDelete(req), req);
}

async function handleDelete(req: NextRequest) {
  const guard = await guardUpload(req);
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

    // SAFETY: never delete a file that is still referenced elsewhere. When the
    // same image is reused in another field (via the copy/paste "image name"
    // feature), removing it here would break those places. So we only unlink
    // when nothing in the database points at this filename any more.
    const refs = await countFileReferences(filename);
    if (refs > 0) {
      return NextResponse.json({
        success: true,
        deleted: false,
        reason: 'still-referenced',
        references: refs,
      });
    }

    await unlink(filePath);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('[upload] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
