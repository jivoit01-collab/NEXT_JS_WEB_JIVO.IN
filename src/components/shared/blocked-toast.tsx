'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function BlockedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('blocked') !== '1') return;

    toast.error('Too many failed login attempts', {
      position: 'bottom-center',
      duration: 10000,
      description: 'Try accessing the admin panel again after 15 minutes.',
    });

    // Strip the param from URL without a page reload
    const url = new URL(window.location.href);
    url.searchParams.delete('blocked');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, router]);

  return null;
}
