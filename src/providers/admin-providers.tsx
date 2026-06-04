'use client';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './theme-provider';

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
