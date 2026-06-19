'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function BlockedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('error') !== 'blocked') return;

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
        'Your IP has been temporarily suspended for 48 hours due to multiple failed login attempts. Please contact your system administrator.',
    });

    // Strip the param from URL without a page reload
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, router]);

  return null;
}
