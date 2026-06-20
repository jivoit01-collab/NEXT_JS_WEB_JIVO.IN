export function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;

  const first = ip.split(',')[0]?.trim();
  if (!first) return null;

  const withoutPort = /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(first)
    ? first.slice(0, first.lastIndexOf(':'))
    : first;

  return withoutPort.startsWith('::ffff:')
    ? withoutPort.slice('::ffff:'.length)
    : withoutPort;
}

export function getClientIpFromHeaders(headers: Headers, hintedIp?: string | null): string | null {
  return (
    normalizeIp(headers.get('x-real-ip')) ??
    normalizeIp(headers.get('x-forwarded-for')) ??
    normalizeIp(headers.get('cf-connecting-ip')) ??
    normalizeIp(hintedIp)
  );
}
