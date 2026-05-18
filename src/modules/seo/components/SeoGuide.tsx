'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from 'sonner';
import { ChevronDown, BookOpen, Copy, Check, Search, MessageCircle, Image as ImageIcon } from 'lucide-react';
import seoGuideContent from '../docs/seo-guide-content';

/* ── Google Search Result mock card ─────────────────────────── */
function GooglePreviewMock({
  title,
  url,
  description,
  highlight,
  richResult,
}: {
  title: string;
  url: string;
  description: string;
  highlight?: 'title' | 'url' | 'description';
  richResult?: string;
}) {
  return (
    <div className="my-3 space-y-2">
      <div className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        <Search className="h-3 w-3" />
        <span>Google Search Result</span>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card px-5 py-4 shadow-sm">
        <p
          className={`truncate text-base font-medium leading-snug ${highlight === 'title' ? 'rounded bg-primary/20 px-1' : ''}`}
          style={{ color: '#1a0dab' }}
        >
          {title}
        </p>
        <p
          className={`mt-0.5 truncate text-[13px] leading-tight ${highlight === 'url' ? 'rounded bg-primary/20 px-1' : ''}`}
          style={{ color: '#006621' }}
        >
          {url}
        </p>
        <p
          className={`mt-1 text-[13px] leading-relaxed ${highlight === 'description' ? 'rounded bg-primary/20 px-1 text-foreground' : 'text-muted-foreground'}`}
        >
          {description}
        </p>
        {richResult && (
          <p className="mt-1 rounded bg-primary/20 px-1 text-[12px] font-medium text-primary">
            {richResult}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── WhatsApp / Social Card mock ─────────────────────────────── */
function SocialPreviewMock({
  domain,
  title,
  description,
  highlight,
}: {
  domain: string;
  title: string;
  description?: string;
  highlight?: 'title' | 'description' | 'image';
}) {
  return (
    <div className="my-3 space-y-2">
      <div className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
        <MessageCircle className="h-3 w-3" />
        <span>WhatsApp / Social Card</span>
      </div>
      <div className="flex justify-start rounded-xl bg-muted/30 p-4">
        <div className="w-full max-w-[320px] overflow-hidden rounded-lg border bg-card shadow-md">
          <div
            className={`flex aspect-video w-full items-center justify-center bg-muted/60 ${highlight === 'image' ? 'ring-2 ring-inset ring-primary/60' : ''}`}
          >
            <div className="text-center text-muted-foreground/40">
              <ImageIcon className="mx-auto mb-1.5 h-8 w-8" />
              <p className="text-[11px]">1200 × 630 OG Image</p>
            </div>
          </div>
          <div className="border-t bg-muted/20 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {domain}
            </p>
            <p
              className={`mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug ${highlight === 'title' ? 'rounded bg-primary/20 px-1 text-foreground' : 'text-foreground'}`}
            >
              {title}
            </p>
            {description && (
              <p
                className={`mt-0.5 line-clamp-2 text-[11px] leading-relaxed ${highlight === 'description' ? 'rounded bg-primary/20 px-1 text-foreground' : 'text-muted-foreground'}`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Code block with copy button ──────────────────────────── */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border/50">
      <div className="flex items-center justify-between border-b border-border/50 bg-[#1e1e2e] px-3 py-1.5">
        <span className="font-mono text-[10px] text-zinc-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-100"
        >
          {copied ? (
            <><Check className="h-2.5 w-2.5 text-green-400" /><span className="text-green-400">Copied!</span></>
          ) : (
            <><Copy className="h-2.5 w-2.5" /><span>Copy</span></>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#1e1e2e',
          padding: '0.75rem 1rem',
          fontSize: '0.7rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace, monospace' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/* ── Main guide component ─────────────────────────────────── */
export function SeoGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-jost-bold">SEO Guide for All Pages</p>
            <p className="text-xs text-muted-foreground">
              Simple explanations for every field
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="overflow-x-hidden border-t px-5 py-6 sm:px-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              /* ── Headings ── */
              h1({ children }) {
                return (
                  <h1 className="mb-4 mt-0 text-xl font-jost-bold text-primary">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="mb-2 mt-7 flex items-center gap-2 text-base font-jost-bold text-violet-400 first:mt-0">
                    <span className="h-px flex-1 bg-violet-400/20" />
                    <span>{children}</span>
                    <span className="h-px flex-1 bg-violet-400/20" />
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="mb-1.5 mt-5 border-l-2 border-primary/60 pl-2.5 text-sm font-jost-bold text-amber-400">
                    {children}
                  </h3>
                );
              },

              /* ── Body text ── */
              p({ children }) {
                return (
                  <p className="my-2 text-sm leading-relaxed text-muted-foreground">
                    {children}
                  </p>
                );
              },
              strong({ children }) {
                return <strong className="font-jost-bold text-foreground">{children}</strong>;
              },
              del({ children }) {
                return (
                  <span className="rounded-sm bg-primary/20 px-0.5 font-medium text-primary">
                    {children}
                  </span>
                );
              },

              /* ── Lists ── */
              ul({ children }) {
                return <ul className="my-2 space-y-1 pl-4">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="my-2 list-decimal space-y-1 pl-4">{children}</ol>;
              },
              li({ children }) {
                return (
                  <li className="text-sm leading-relaxed text-muted-foreground before:mr-1.5 before:text-primary before:content-['•']">
                    {children}
                  </li>
                );
              },

              /* ── Code blocks — special preview types + syntax highlighter ── */
              code({ className, children }) {
                const match = /language-([\w-]+)/.exec(className ?? '');
                if (match) {
                  const lang = match[1];
                  const raw = String(children).replace(/\n$/, '');

                  if (lang === 'google-preview') {
                    try {
                      const data = JSON.parse(raw) as {
                        title: string;
                        url: string;
                        description: string;
                        highlight?: 'title' | 'url' | 'description';
                        richResult?: string;
                      };
                      return <GooglePreviewMock {...data} />;
                    } catch { /* fall through to syntax highlighter */ }
                  }

                  if (lang === 'social-preview') {
                    try {
                      const data = JSON.parse(raw) as {
                        domain: string;
                        title: string;
                        description?: string;
                        highlight?: 'title' | 'description' | 'image';
                      };
                      return <SocialPreviewMock {...data} />;
                    } catch { /* fall through to syntax highlighter */ }
                  }

                  return <CodeBlock language={lang} code={raw} />;
                }
                return (
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-primary">
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return <>{children}</>;
              },

              /* ── Table — scrollable, compact ── */
              table({ children }) {
                return (
                  <div className="my-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-primary/10">{children}</thead>;
              },
              tbody({ children }) {
                return <tbody className="divide-y divide-border">{children}</tbody>;
              },
              tr({ children }) {
                return <tr className="transition-colors hover:bg-muted/20">{children}</tr>;
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 text-left text-xs font-jost-bold uppercase tracking-wider text-primary">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {children}
                  </td>
                );
              },

              /* ── HR ── */
              hr() {
                return <hr className="my-5 border-border/50" />;
              },

              /* ── Blockquote ── */
              blockquote({ children }) {
                return (
                  <blockquote className="my-3 border-l-2 border-amber-400/60 bg-amber-400/5 px-3 py-1.5 text-sm italic text-muted-foreground">
                    {children}
                  </blockquote>
                );
              },

              /* ── Links → plain highlighted text, no navigation ── */
              a({ children }) {
                return (
                  <span className="font-medium text-primary/80">{children}</span>
                );
              },
            }}
          >
            {seoGuideContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}