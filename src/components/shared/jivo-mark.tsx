'use client';

// ==========================================================================
// JivoMark — the EXACT navbar logo, reused for chat icon surfaces.
//
// This does not redraw or rearrange anything: it renders the very same
// <JivoLogo> component the navbar and footer use (identical paths, identical
// proportions, identical animation), simply sized for the surface it sits on.
//
// An earlier version tried to build a square "face" icon by extracting the two
// arcs and stacking them. That is NOT the Jivo logo — the arcs sit diagonally
// around the JIVO wordmark, and pulling them out of that arrangement produced a
// mark the brand does not use. Reusing the real component removes that whole
// class of drift: if the logo is ever updated, this follows automatically.
// ==========================================================================

import type { CSSProperties } from 'react';
import { JivoLogo } from './jivo-logo';

interface JivoMarkProps {
  /** Sizing / colour classes, e.g. "h-6 w-6 text-white". */
  className?: string;
  style?: CSSProperties;
  /** Accessible label. Omit to keep the mark decorative. */
  title?: string;
  /** Play the wink + grin reaction on hover/focus. Default: true. */
  animated?: boolean;
}

export function JivoMark({ className, style, title = 'Jivo', animated = true }: JivoMarkProps) {
  return (
    <JivoLogo
      className={className}
      style={style}
      title={title}
      interactive={animated}
    />
  );
}
