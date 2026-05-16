import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

/** Root-level uploads directory (outside /public) */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const PLACEHOLDER_PATH = path.join(process.cwd(), 'uploads', 'placeholder.png');

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // Block directory traversal
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  let filePath = path.join(UPLOAD_DIR, filename);

  // Fall back to the placeholder when the requested file doesn't exist
  if (!existsSync(filePath)) {
    if (existsSync(PLACEHOLDER_PATH)) {
      filePath = PLACEHOLDER_PATH;
    } else {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  try {
    const buffer = await readFile(filePath);
    const responseContentType = filePath === PLACEHOLDER_PATH ? 'image/png' : contentType;

    if (responseContentType.startsWith('video/')) {
      const range = req.headers.get('range');

      if (range) {
        const match = range.match(/bytes=(\d*)-(\d*)/);
        const start = match?.[1] ? Number(match[1]) : 0;
        const end = match?.[2] ? Number(match[2]) : buffer.length - 1;
        const safeEnd = Math.min(end, buffer.length - 1);
        const chunk = buffer.subarray(start, safeEnd + 1);

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            'Content-Type': responseContentType,
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${start}-${safeEnd}/${buffer.length}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          },
        });
      }
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': responseContentType,
        'Content-Length': String(buffer.length),
        ...(responseContentType.startsWith('video/') && { 'Accept-Ranges': 'bytes' }),
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
