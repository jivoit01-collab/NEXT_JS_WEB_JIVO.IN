'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function BlockedToast() {
  useEffect(() => {
    const hasBlockedCookie = document.cookie
      .split(';')
      .some((item) => item.trim() === 'admin_blocked=1');
    const url = new URL(window.location.href);
    const hasBlockedParam = url.searchParams.get('error') === 'blocked';

    if (!hasBlockedCookie && !hasBlockedParam) return;

    document.cookie = 'admin_blocked=; Max-Age=0; Path=/; SameSite=Lax';

    if (hasBlockedParam) {
      url.searchParams.delete('error');
      window.history.replaceState(null, '', url.pathname + url.search);
    }

    toast.error('Access Denied', {
      position: 'top-right',
      duration: 10000,
      className:
        '!w-[356px] !rounded-[10px] !border !border-red-500/35 !bg-red-950 !px-4 !py-4 !text-red-50 !shadow-lg',
      classNames: {
        content: '!gap-1',
        icon: '!text-red-400',
        title: '!font-jost-bold !text-sm !leading-none !text-red-100',
        description: '!mt-1 !text-sm !leading-snug !text-red-100/90',
      },
      description:
        'Error 429: Account temporarily locked due to security policy. Please contact developer support team.',
    });
  }, []);

  return null;
}
