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
  FileText,
  ExternalLink,
  MessageCircle,
  Phone,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
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

function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

const ProductCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; entityId: string | null; url: string | null };
  return (
    <Shell icon={Package}>
      <div className="font-medium">{d.title}</div>
      {/* Always opens the storefront (shop.jivo.in) in a new tab — routed by the widget. */}
      <LinkRow label="View Products" onClick={() => ctx.onCardAction(card, 'view_product')} />
    </Shell>
  );
};

const BuyProductCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; entityId: string | null; available: boolean };
  return (
    <Shell icon={ShoppingCart}>
      <div className="font-medium">{d.title}</div>
      <LinkRow label="View Products" onClick={() => ctx.onCardAction(card, 'buy_product')} />
    </Shell>
  );
};

const CmsCard: CardComponent = ({ card, ctx }) => {
  const d = card.data as { title: string; url: string | null; entityId: string | null };
  return (
    <Shell icon={FileText}>
      <div className="font-medium">{d.title}</div>
      <LinkRow label="Read article" onClick={() => ctx.onCardAction(card, 'open_link', d.url ?? d.entityId ?? undefined)} />
    </Shell>
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
  const d = card.data as { prefill: { email?: string; phone?: string } };
  const { phone, email } = d.prefill ?? {};
  return (
    <Shell icon={Phone}>
      <div className="font-medium">Get in touch with Jivo</div>
      {/* Surface any contact details the response extracted from Knowledge. */}
      {phone ? (
        <a href={`tel:${phone}`} className="mt-0.5 block text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          📞 {phone}
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="mt-0.5 block text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ✉️ {email}
        </a>
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
};

/** Card kinds that are never rendered in the simplified chat. */
const HIDDEN_KINDS = new Set<CardKind>(['answer', 'suggested_questions', 'social', 'feedback_cta']);

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
