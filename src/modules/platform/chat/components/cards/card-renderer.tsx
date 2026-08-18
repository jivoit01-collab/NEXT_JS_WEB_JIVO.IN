'use client';

// ==========================================================================
// Experience Card renderer — a CLIENT-side registry mapping each CardKind to a
// small presentational component. This is intentionally SEPARATE from the server
// card-builder registry (importing that side-effect barrel into a client file
// would duplicate React). The planner decides WHICH cards exist; this only draws
// the descriptors it is given.
// ==========================================================================

import type { ComponentType } from 'react';
import {
  Package,
  ExternalLink,
  MessageCircle,
  Phone,
  ArrowRight,
  Mail,
  MapPin,
} from 'lucide-react';
import { HoverUnderlineText } from '@/components/shared/hover-underline-text';
import { getSocialIcon } from '@/components/layout/footer-social-icons';
import { LinkPreviewCard, type LinkPreview } from './link-preview-card';
import type { ExperienceCard, CardKind } from '@/modules/platform/experience';

export interface CardActionContext {
  /** Fired when a card's primary control is used (analytics + navigation). */
  onCardAction: (card: ExperienceCard, action: string, target?: string) => void;
}

type CardComponent = ComponentType<{ card: ExperienceCard; ctx: CardActionContext }>;

function Shell({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-black/10 bg-white/70 p-2.5 text-sm dark:border-white/10 dark:bg-white/5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * The ONE place a link arrow is drawn.
 *
 * Callers pass a bare label ("Jivo Canola Oil") and never append "→" themselves —
 * doing so produced the "Jivo Canola Oil → →" double arrow. Styling reuses the
 * footer's `HoverUnderlineText` so chat links behave exactly like site links.
 */
function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mt-1 inline-flex cursor-pointer items-center gap-1 rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none"
    >
      <HoverUnderlineText>{label}</HoverUnderlineText>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-[#0a7d3f] transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden
      />
    </button>
  );
}

/** Card payload shape carrying an unfurled preview (see gateway/page-preview). */
interface CardPreviewData {
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
}

/**
 * Build the preview from a card's payload. Falls back to the card's own title +
 * url when the destination has no CMS SEO row, so a card is never blank.
 */
function toPreview(d: {
  title?: string;
  url?: string | null;
  preview?: CardPreviewData | null;
}): LinkPreview | null {
  const url = d.preview?.url ?? d.url;
  if (!url) return null;
  return {
    url,
    title: d.preview?.title || d.title || url,
    description: d.preview?.description ?? null,
    image: d.preview?.image ?? null,
    domain: d.preview?.domain ?? null,
  };
}

const ProductCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; url: string | null; preview?: CardPreviewData | null };
  const preview = toPreview(d);
  // Without a page URL there is nothing to unfurl — fall back to the storefront
  // action rather than rendering an empty card.
  if (!preview) {
    return (
      <Shell icon={Package}>
        <div className="font-medium">{d.title}</div>
        <LinkRow label="View Products" onClick={() => ctx.onCardAction(card, 'view_product')} />
      </Shell>
    );
  }
  return (
    <LinkPreviewCard preview={preview} onOpen={(url) => ctx.onCardAction(card, 'open_link', url)} />
  );
};

const BuyProductCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as {
    title: string;
    url?: string | null;
    preview?: CardPreviewData | null;
    marketplaces?: { key: string; label: string; url: string }[];
  };
  const preview = toPreview(d);
  if (!preview) return null;
  const marketplaces = d.marketplaces ?? [];
  return (
    <>
      <LinkPreviewCard preview={preview} onOpen={(url) => ctx.onCardAction(card, 'buy_product', url)} />
      {/* Marketplaces appear ONLY when a real URL is configured — never guessed. */}
      {marketplaces.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs opacity-60">Also on</span>
          {marketplaces.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => ctx.onCardAction(card, 'open_link', m.url)}
              className="rounded-full border border-black/15 px-2.5 py-1 text-xs font-medium transition-colors duration-300 hover:border-[#0a7d3f] hover:text-[#0a7d3f] focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none dark:border-white/20"
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
};

const CmsCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; url: string | null; preview?: CardPreviewData | null };
  const preview = toPreview(d);
  // A document with no page (e.g. the contact record) has nothing to link to.
  if (!preview) return null;
  return (
    <LinkPreviewCard preview={preview} onOpen={(url) => ctx.onCardAction(card, 'open_link', url)} />
  );
};

/**
 * Social links — the footer's circular brand icons, each with its platform NAME
 * beside it so the destination is readable rather than icon-only.
 *
 * Icons and labels come from the footer's `SOCIAL_ICONS` registry and the URLs
 * from `FooterSocialLink`, so nothing is duplicated or invented.
 */
const SocialCard: CardComponent = ({ card }) => {
  const d = card.data as { message: string; links?: { platform: string; url: string }[] };
  const links = (d.links ?? []).filter((l) => getSocialIcon(l.platform));
  if (links.length === 0) return null;

  return (
    <div className="mt-2 rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-sm font-medium">{d.message}</div>
      <ul className="mt-2 flex flex-wrap items-center gap-2">
        {links.map((l) => {
          const entry = getSocialIcon(l.platform)!;
          const { Icon, label } = entry;
          return (
            <li key={l.platform}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                // Footer treatment: circular outline that fills brand-green on hover.
                className="group flex items-center gap-2 rounded-full border border-[#bbb] py-1 pr-3 pl-1 text-[#555] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-[#0a7d3f] [@media(hover:hover)]:hover:text-[#0a7d3f] dark:border-white/25 dark:text-white/70"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] transition-colors duration-300 [@media(hover:hover)]:group-hover:border-[#0a7d3f] [@media(hover:hover)]:group-hover:bg-[#0a7d3f] [@media(hover:hover)]:group-hover:text-white dark:border-white/20">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-xs font-medium">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ReadMoreCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; url: string; external: boolean };
  return (
    <Shell icon={ExternalLink}>
      <LinkRow label={d.title || 'Read more'} onClick={() => ctx.onCardAction(card, 'open_link', d.url)} />
    </Shell>
  );
};

const CtaCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { label: string; action: string; target?: string };
  // A contact CTA always reads "Contact our team" (never "Talk to our team").
  const label = d.action === 'contact_support' ? 'Contact our team' : d.label;
  return (
    <button
      type="button"
      onClick={() => ctx.onCardAction(card, d.action, d.target)}
      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </button>
  );
};

const ContactCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { prefill: { email?: string; phone?: string; address?: string } };
  const { phone, email, address } = d.prefill ?? {};
  // `tel:` needs the bare number — the display value may carry a label such as
  // "1800 137 4433 (TOLL FREE)".
  const telHref = phone?.replace(/[^\d+]/g, '');
  return (
    <Shell icon={Phone}>
      <div className="font-medium">Get in touch with Jivo</div>
      {/* Verified CMS contact details — the ONE place they appear, so the
          assistant's text never repeats them. */}
      {/* Contact links reuse the FOOTER's hover treatment (HoverUnderlineText):
          same colour warm-up + green underline sweep, so chat and footer speak one
          design language. `group` is required by that component. */}
      {phone ? (
        <a
          href={`tel:${telHref}`}
          className="group mt-1 flex w-fit items-center gap-1.5 rounded-sm text-sm focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none"
        >
          <Phone className="h-3.5 w-3.5 shrink-0 text-[#0a7d3f]" aria-hidden />
          <HoverUnderlineText>{phone}</HoverUnderlineText>
        </a>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          className="group mt-1 flex w-fit items-center gap-1.5 rounded-sm text-sm focus-visible:ring-2 focus-visible:ring-[#0a7d3f] focus-visible:outline-none"
        >
          <Mail className="h-3.5 w-3.5 shrink-0 text-[#0a7d3f]" aria-hidden />
          <HoverUnderlineText>{email}</HoverUnderlineText>
        </a>
      ) : null}
      {address ? (
        <div className="mt-1 flex items-start gap-1.5 text-sm opacity-75">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0a7d3f]" aria-hidden />
          <span>{address}</span>
        </div>
      ) : null}
      <LinkRow label="Contact our team" onClick={() => ctx.onCardAction(card, 'contact_support', email ?? phone)} />
    </Shell>
  );
};

/**
 * Client card registry (Phase 8.2 simplification). Only the professional
 * marketing cards are rendered: product · cms · read_more · cta · contact.
 * `social` and `feedback_cta` (Was-this-helpful 👍/👎) are intentionally NOT
 * rendered — the response stays clean. `answer` / `suggested_questions` are
 * rendered by the message list / questions strip.
 */
const REGISTRY: Partial<Record<CardKind, CardComponent>> = {
  product: ProductCard,
  buy_product: BuyProductCard,
  cms: CmsCard,
  read_more: ReadMoreCard,
  cta: CtaCard,
  contact: ContactCard,
  social: SocialCard,
};

/** Card kinds that are never rendered in the simplified chat. */
// `social` is now RENDERED (footer-style follow links on a social turn).
const HIDDEN_KINDS = new Set<CardKind>(['answer', 'suggested_questions', 'feedback_cta']);

export function ExperienceCards({ cards, ctx }: { cards: ExperienceCard[]; ctx: CardActionContext }) {
  let renderable = cards.filter((c) => !HIDDEN_KINDS.has(c.kind));

  // Exactly ONE contact button. The Experience Planner may emit BOTH a Contact
  // card ("Contact our team") and a contact_support CTA ("Talk to our team");
  // when a Contact card is present, drop the duplicate contact CTA.
  const hasContactCard = renderable.some((c) => c.kind === 'contact');
  if (hasContactCard) {
    renderable = renderable.filter(
      (c) => !(c.kind === 'cta' && (c.data as { action?: string }).action === 'contact_support'),
    );
  }

  // When a real product PAGE link is already shown, a generic "View products"
  // CTA repeats it. Keep the specific link, drop the generic button.
  const hasProductPageLink = renderable.some(
    (c) =>
      (c.kind === 'product' || c.kind === 'buy_product') &&
      Boolean((c.data as { url?: string | null }).url),
  );
  if (hasProductPageLink) {
    renderable = renderable.filter(
      (c) => !(c.kind === 'cta' && (c.data as { action?: string }).action === 'view_product'),
    );
  }

  // Never render the same destination twice (e.g. a product card and a CMS card
  // resolved to the same page).
  const seenUrls = new Set<string>();
  renderable = renderable.filter((c) => {
    const url = (c.data as { url?: string | null }).url;
    if (!url) return true;
    if (seenUrls.has(url)) return false;
    seenUrls.add(url);
    return true;
  });

  if (renderable.length === 0) return null;
  return (
    <div className="mt-1 space-y-1">
      {renderable.map((card) => {
        const Comp = REGISTRY[card.kind];
        return Comp ? <Comp key={card.id} card={card} ctx={ctx} /> : null;
      })}
    </div>
  );
}
