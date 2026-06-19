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

export function ipInSubnet(ip: string, subnet: string): boolean {
  const normalizedSubnet = subnet.trim();

  if (!normalizedSubnet.includes('/')) {
    return ip === normalizedSubnet;
  }

  const [subnetIp, mask] = normalizedSubnet.split('/');
  const bitMask = Number.parseInt(mask, 10);

  const ipToLong = (address: string) => {
    const octets = address.split('.');

    if (
      octets.length !== 4 ||
      octets.some((octet) => {
        const value = Number.parseInt(octet, 10);
        return !/^\d+$/.test(octet) || Number.isNaN(value) || value < 0 || value > 255;
      })
    ) {
      throw new Error('Invalid IPv4 address');
    }

    return octets.reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0;
  };

  try {
    if (Number.isNaN(bitMask) || bitMask < 0 || bitMask > 32 || !subnetIp) {
      return false;
    }

    const ipLong = ipToLong(ip);
    const subnetLong = ipToLong(subnetIp);
    const maskBit = bitMask === 0 ? 0 : (~0 << (32 - bitMask)) >>> 0;

    return (ipLong & maskBit) === (subnetLong & maskBit);
  } catch {
    return false;
  }
}

export function allowedAdminIpEntries(): string[] {
  return (process.env.ALLOWED_ADMIN_IPS ?? '')
    .split(',')
    .map((ip) => normalizeIp(ip))
    .filter((ip): ip is string => Boolean(ip));
}

export function isAllowedAdminIp(ip: string): boolean {
  return allowedAdminIpEntries().some((allowedIp) => {
    if (allowedIp === ip) return true;
    return ipInSubnet(ip, allowedIp);
  });
}
