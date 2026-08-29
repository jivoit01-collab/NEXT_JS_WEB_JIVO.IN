/**
 * Where the admin's file uploads/deletes are sent.
 *
 * By default this is the SAME origin the app runs on ('' → relative `/api/upload`),
 * so nothing changes for normal local dev or production.
 *
 * Set `NEXT_PUBLIC_UPLOAD_ORIGIN` to an absolute origin (e.g. "https://jivo.in")
 * to make a LOCALLY-run admin upload straight to the LIVE server's disk — the
 * file lands in the server's `uploads/` folder and is instantly public at
 * `<origin>/uploads/images/<file>`, with no rebuild or folder copy. The stored
 * DB value stays a bare filename, so the public site resolves it the same way
 * everywhere.
 *
 * Requirements when pointing at a remote origin:
 *   - that origin must be reachable and running the same app;
 *   - you must be signed in as an admin THERE (the upload route is admin-only),
 *     which means the auth cookie for that origin must be present — so uploads
 *     are sent with credentials included;
 *   - that origin must allow this dev origin via CORS on /api/upload (see the
 *     OPTIONS/CORS handling added to the upload route).
 */
const RAW_ORIGIN = process.env.NEXT_PUBLIC_UPLOAD_ORIGIN?.trim() ?? '';

/** Normalized origin with no trailing slash, or '' for same-origin. */
export const UPLOAD_ORIGIN = RAW_ORIGIN.replace(/\/$/, '');

/** Full URL for the upload/delete endpoint. */
export function uploadEndpoint(): string {
  return `${UPLOAD_ORIGIN}/api/upload`;
}

/**
 * Optional shared upload key. When NEXT_PUBLIC_UPLOAD_KEY is set (e.g. running
 * the admin locally to upload to the live server), it is sent as `x-upload-key`
 * so the server authorizes the upload WITHOUT a browser session on that origin.
 * Must match UPLOAD_API_KEY on the target server. Empty → not sent.
 */
const UPLOAD_KEY = process.env.NEXT_PUBLIC_UPLOAD_KEY?.trim() ?? '';

/**
 * Headers to send with upload/delete requests. Includes the shared key when set.
 * The caller adds Content-Type for JSON deletes; multipart uploads must NOT set
 * Content-Type (the browser sets the multipart boundary), so this returns only
 * the key header and each call spreads it into its own headers object.
 */
export function uploadAuthHeaders(): Record<string, string> {
  return UPLOAD_KEY ? { 'x-upload-key': UPLOAD_KEY } : {};
}

/**
 * fetch() options needed to talk to the upload endpoint. When uploading to a
 * REMOTE origin we must send that origin's auth cookie, so credentials are
 * included; for same-origin this is a harmless default.
 */
export const UPLOAD_FETCH_INIT: Pick<RequestInit, 'credentials'> = {
  credentials: 'include',
};
