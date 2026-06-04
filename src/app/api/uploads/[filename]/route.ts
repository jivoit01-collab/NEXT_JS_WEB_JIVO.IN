import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';
import { open, readFile, stat, type FileHandle } from 'fs/promises';

export const runtime = 'nodejs';

/** Root-level uploads directory (outside /public) */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
const PLACEHOLDER_PATH = path.join(process.cwd(), 'uploads', 'placeholder.png');
const VIDEO_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks keep 300-400MB videos from spiking memory.
const STREAM_READ_SIZE = 256 * 1024;

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

function createAbortSafeFileStream(filePath: string, start: number, end: number) {
  let fileHandle: FileHandle | null = null;
  let openingPromise: Promise<void> | null = null;
  let offset = start;
  let cancelled = false;

  async function closeFile() {
    if (!fileHandle) return;
    const handle = fileHandle;
    fileHandle = null;
    await handle.close().catch(() => undefined);
  }

  async function ensureOpen() {
    if (fileHandle || cancelled) return;

    openingPromise ??= open(filePath, 'r').then(async (handle) => {
      if (cancelled) {
        await handle.close().catch(() => undefined);
        return;
      }

      fileHandle = handle;
    });

    await openingPromise;
  }

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      await ensureOpen();
      if (cancelled || !fileHandle) return;

      try {
        const remaining = end - offset + 1;
        if (remaining <= 0) {
          await closeFile();
          if (!cancelled) controller.close();
          return;
        }

        const buffer = Buffer.allocUnsafe(Math.min(STREAM_READ_SIZE, remaining));
        const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, offset);

        if (cancelled) {
          await closeFile();
          return;
        }

        if (bytesRead <= 0) {
          await closeFile();
          if (!cancelled) controller.close();
          return;
        }

        offset += bytesRead;
        controller.enqueue(buffer.subarray(0, bytesRead));
      } catch (error) {
        await closeFile();
        if (!cancelled) controller.error(error);
      }
    },
    async cancel() {
      cancelled = true;
      await openingPromise?.catch(() => undefined);
      await closeFile();
    },
  });
}

function parseVideoRange(rangeHeader: string, fileSize: number) {
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  const [, rawStart, rawEnd] = match;

  if (!rawStart && !rawEnd) return null;

  if (!rawStart && rawEnd) {
    const suffixLength = Number(rawEnd);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;

    const start = Math.max(fileSize - suffixLength, 0);
    return { start, end: fileSize - 1 };
  }

  const start = Number(rawStart);
  if (!Number.isFinite(start) || start < 0 || start >= fileSize) return null;

  const requestedEnd = rawEnd ? Number(rawEnd) : start + VIDEO_CHUNK_SIZE - 1;
  if (!Number.isFinite(requestedEnd) || requestedEnd < start) return null;

  return {
    start,
    end: Math.min(requestedEnd, fileSize - 1, start + VIDEO_CHUNK_SIZE - 1),
  };
}

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
    const responseContentType = filePath === PLACEHOLDER_PATH ? 'image/png' : contentType;
    const cacheControl =
      filePath === PLACEHOLDER_PATH
        ? 'public, max-age=86400, s-maxage=604800'
        : 'public, max-age=31536000, immutable';

    if (responseContentType.startsWith('video/')) {
      const fileStats = await stat(filePath);
      const fileSize = fileStats.size;
      const rangeHeader = req.headers.get('range');

      // Streaming byte ranges avoids loading the complete 400MB video into RAM for every request.
      // The custom stream also closes quietly if the browser aborts during scroll or seek.
      if (rangeHeader) {
        const range = parseVideoRange(rangeHeader, fileSize);

        if (!range) {
          return new NextResponse(null, {
            status: 416,
            headers: {
              'Content-Range': `bytes */${fileSize}`,
              'Accept-Ranges': 'bytes',
            },
          });
        }

        const contentLength = range.end - range.start + 1;

        return new NextResponse(createAbortSafeFileStream(filePath, range.start, range.end), {
          status: 206,
          headers: {
            'Content-Type': responseContentType,
            'Content-Length': String(contentLength),
            'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          },
        });
      }

      return new NextResponse(createAbortSafeFileStream(filePath, 0, fileSize - 1), {
        status: 200,
        headers: {
          'Content-Type': responseContentType,
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        },
      });
    }

    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': responseContentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('[UPLOAD API] GET error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
