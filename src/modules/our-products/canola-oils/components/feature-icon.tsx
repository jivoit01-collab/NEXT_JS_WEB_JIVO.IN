import {
  Sprout,
  Hand,
  Atom,
  Wheat,
  Leaf,
  HeartHandshake,
  Droplet,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon keys selectable from the admin editor.
 * Keep keys stable — they are persisted in the section JSON.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  seedling: Sprout,
  hand: Hand,
  molecule: Atom,
  wheat: Wheat,
  leaf: Leaf,
  heart: HeartHandshake,
  droplet: Droplet,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

/** Renders the mapped icon, falling back to a leaf when the key is unknown. */
export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Leaf;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.25} />;
}
