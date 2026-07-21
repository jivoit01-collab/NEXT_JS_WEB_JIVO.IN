import Link from 'next/link';
import { Lock } from 'lucide-react';

/** Short privacy reassurance shown under the sign-in options. */
export function AuthPrivacyNote() {
  return (
    <p className="text-muted-foreground flex items-start gap-2 text-[11px] leading-relaxed 2xl:text-xs">
      <Lock size={13} className="mt-0.5 shrink-0" />
      <span>
        We only use your account to personalise your experience. We never sell your data. See our{' '}
        <Link href="/privacy-policy" className="text-primary underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </span>
    </p>
  );
}
