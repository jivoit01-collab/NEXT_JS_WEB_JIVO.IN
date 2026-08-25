import { PrivacyHero } from './hero-section';
import { PrivacyBody } from './body-section';
import type { PrivacyHeroContent, PrivacyBodyContent } from '../types';
import { PRIVACY_MAROON } from '../constants';

interface PrivacyPolicyMainProps {
  sections: Map<string, unknown>;
}

/**
 * The whole Privacy Policy page is ONE maroon field. The colour lives on this
 * wrapper (not per-section), so the hero and body share a seamless background.
 */
export function PrivacyPolicyMain({ sections }: PrivacyPolicyMainProps) {
  return (
    <main className="w-full" style={{ backgroundColor: PRIVACY_MAROON }}>
      <PrivacyHero data={sections.get('hero') as PrivacyHeroContent | undefined} />
      <PrivacyBody data={sections.get('body') as PrivacyBodyContent | undefined} />
    </main>
  );
}
