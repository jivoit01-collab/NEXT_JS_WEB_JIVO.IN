import { Sparkles, Bookmark, MessageSquareHeart, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  { icon: Sparkles, text: 'Personalised recommendations' },
  { icon: Bookmark, text: 'Save favourites & preferences' },
  { icon: MessageSquareHeart, text: 'Faster support & feedback' },
  { icon: ShieldCheck, text: 'Secure, privacy-first account' },
];

/** Why sign in — kept honest and benefit-led (auth is never forced). */
export function AuthBenefits() {
  return (
    <ul className="grid gap-2.5">
      {BENEFITS.map((b) => {
        const Icon = b.icon;
        return (
          <li key={b.text} className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <span className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Icon size={14} className="text-primary" />
            </span>
            {b.text}
          </li>
        );
      })}
    </ul>
  );
}
