import { PrivacyHeroSkeleton } from '@/modules/privacy-policy/components/hero-section';
import { PrivacyBodySkeleton } from '@/modules/privacy-policy/components/body-section';
import { PRIVACY_MAROON } from '@/modules/privacy-policy/constants';

export default function PrivacyPolicyLoading() {
  return (
    <main className="w-full" style={{ backgroundColor: PRIVACY_MAROON }}>
      <PrivacyHeroSkeleton />
      <PrivacyBodySkeleton />
    </main>
  );
}
