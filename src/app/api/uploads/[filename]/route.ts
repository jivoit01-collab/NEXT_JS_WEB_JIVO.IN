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
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // Block directory traversal
  if (
    !filename ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.includes('..')
  ) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  let filePath = path.join(UPLOAD_DIR, filename);

  // Fall back to the placeholder when the requested file doesn't exist
  if (!existsSync(filePath)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[UPLOAD API] Missing file:', filename);
    }
    if (existsSync(PLACEHOLDER_PATH)) {
      filePath = PLACEHOLDER_PATH;
    } else {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  try {
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': filePath === PLACEHOLDER_PATH ? 'image/png' : contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
