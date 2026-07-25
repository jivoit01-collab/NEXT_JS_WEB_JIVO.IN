// ==========================================================================
// Link extractor — collect markdown links [label](href) and bare URLs, labelled
// and classified internal/external. Runs on the RAW text (before inline stripping)
// so it can see the markdown link syntax.
// ==========================================================================

import { isExternalHost } from '../utils';
import type { ResponseLink } from '../types';

const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
const BARE_URL = /(?<!\]\()(?<!["'=])https?:\/\/[^\s)<>"']+/g;

export function extractLinks(rawText: string): ResponseLink[] {
  const out: ResponseLink[] = [];
  const seen = new Set<string>();

  const add = (href: string, label: string) => {
    const clean = href.replace(/[.,)]+$/, '');
    if (seen.has(clean)) return;
    seen.add(clean);
    out.push({ href: clean, label: label.trim() || clean, external: isExternalHost(clean) });
  };

  for (const m of rawText.matchAll(MD_LINK)) add(m[2], m[1]);
  for (const m of rawText.matchAll(BARE_URL)) add(m[0], m[0]);

  return out;
}
