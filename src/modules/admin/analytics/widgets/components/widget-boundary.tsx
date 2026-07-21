'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Per-widget error boundary. A single failing widget renders a small "couldn't
 * load" card instead of crashing the whole analytics page. Combined with the
 * data source's own try/catch, the dashboard can never show a full-page error.
 */
export class WidgetBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error('[widget] render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-card text-muted-foreground flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
          <AlertTriangle size={18} className="opacity-60" />
          <p className="text-xs 2xl:text-sm">This widget couldn’t load. Try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
