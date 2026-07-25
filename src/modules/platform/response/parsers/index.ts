// ==========================================================================
// Parsers — SAFE markdown parsing. A small, dependency-free block tokenizer that
// turns markdown into a bounded list of plain-text ContentBlocks. It NEVER emits
// raw HTML: fenced code is kept verbatim as text, everything else has inline
// markdown/HTML stripped. This eliminates any XSS/markup-injection surface.
// ==========================================================================

import { RESPONSE_CONFIG } from '../config';
import { stripInlineMarkdown } from '../utils';
import type { ContentBlock } from '../types';

const HEADING = /^(#{1,6})\s+(.*)$/;
const UL_ITEM = /^\s*[-*+]\s+(.*)$/;
const OL_ITEM = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const FENCE = /^```(\w+)?\s*$/;

/** Parse markdown text into safe, renderer-ready blocks (bounded count). */
export function parseMarkdown(text: string): ContentBlock[] {
  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let i = 0;

  const push = (b: ContentBlock) => {
    if (blocks.length < RESPONSE_CONFIG.maxBlocks) blocks.push(b);
  };

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → skip.
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Fenced code — kept VERBATIM as text (never interpreted).
    const fence = FENCE.exec(line);
    if (fence) {
      const language = fence[1];
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i])) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      push({ type: 'code', text: buf.join('\n'), meta: { language } });
      continue;
    }

    // Heading.
    const heading = HEADING.exec(line);
    if (heading) {
      push({ type: 'heading', text: stripInlineMarkdown(heading[2]), meta: { level: heading[1].length } });
      i += 1;
      continue;
    }

    // Quote (single or consecutive lines).
    if (QUOTE.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        buf.push(QUOTE.exec(lines[i])![1]);
        i += 1;
      }
      push({ type: 'quote', text: stripInlineMarkdown(buf.join(' ')) });
      continue;
    }

    // Ordered list.
    if (OL_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_ITEM.test(lines[i])) {
        items.push(stripInlineMarkdown(OL_ITEM.exec(lines[i])![1]));
        i += 1;
      }
      push({ type: 'ordered-list', text: items.join('\n'), items });
      continue;
    }

    // Unordered list.
    if (UL_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_ITEM.test(lines[i])) {
        items.push(stripInlineMarkdown(UL_ITEM.exec(lines[i])![1]));
        i += 1;
      }
      push({ type: 'list', text: items.join('\n'), items });
      continue;
    }

    // Paragraph — accumulate until a blank line or a block starter.
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !HEADING.test(lines[i]) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i]) &&
      !QUOTE.test(lines[i]) &&
      !FENCE.test(lines[i])
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    push({ type: 'paragraph', text: stripInlineMarkdown(buf.join(' ')) });
  }

  return blocks;
}
