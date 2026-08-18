'use client';

// Minimal, SAFE markdown renderer — no external deps, no dangerouslySetInnerHTML.
// Handles paragraphs, bullet/numbered lists, inline **bold**, *italic*, `code`
// and [links](url). Anything else renders as plain text. This is presentation
// only; the Response Platform already sanitized the model output upstream.
import { Fragment, type ReactNode } from 'react';

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g;

/**
 * Is this href on a DIFFERENT origin than the page we're on?
 *
 * Relative paths are same-origin by definition. Absolute URLs are compared by
 * origin, so our own absolute links (which preview cards and CMS metadata use)
 * are correctly treated as internal.
 */
function isExternalHref(href: string): boolean {
  if (href.startsWith('/')) return false;
  if (typeof window === 'undefined') return /^https?:\/\//i.test(href);
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    const token = m[0];
    const idx = m.index ?? 0;
    if (idx > last) out.push(<Fragment key={key++}>{text.slice(last, idx)}</Fragment>);
    if (token.startsWith('**')) out.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith('`')) out.push(<code key={key++} className="rounded bg-black/10 px-1 py-0.5 text-[0.85em] dark:bg-white/15">{token.slice(1, -1)}</code>);
    else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']'));
      const href = token.slice(token.indexOf('(') + 1, -1);
      // Same-origin links stay in this tab; only genuinely other origins open a
      // new one. Comparing ORIGINS (not "starts with http") matters because our
      // own links are absolute — "https://jivo.in/…" is this site, not external.
      const external = isExternalHref(href);
      out.push(
        <a key={key++} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="rounded-sm font-medium text-emerald-700 underline decoration-emerald-700/40 underline-offset-2 transition-colors hover:text-emerald-800 hover:decoration-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none motion-reduce:transition-none dark:text-emerald-400 dark:decoration-emerald-400/40 dark:hover:text-emerald-300">
          {label}
        </a>,
      );
    } else out.push(<em key={key++}>{token.slice(1, -1)}</em>);
    last = idx + token.length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const isUl = lines.every((l) => /^\s*[-*]\s+/.test(l));
        const isOl = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isUl) {
          return (
            <ul key={i} className="list-disc space-y-0.5 pl-5">
              {lines.map((l, j) => <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ''))}</li>)}
            </ul>
          );
        }
        if (isOl) {
          return (
            <ol key={i} className="list-decimal space-y-0.5 pl-5">
              {lines.map((l, j) => <li key={j}>{renderInline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>)}
            </ol>
          );
        }
        return <p key={i} className="whitespace-pre-wrap break-words">{renderInline(block)}</p>;
      })}
    </div>
  );
}
