import { JsonLd } from '@/components/shared/public';
import { PrivacyPolicyMain } from '@/modules/privacy-policy';
import { getPrivacyPolicySections } from '@/modules/privacy-policy/data/queries';
import { defaultSeo } from '@/modules/privacy-policy/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('privacy-policy', defaultSeo);
}

export default async function PrivacyPolicyPage() {
  const [sections, structuredData] = await Promise.all([
    getPrivacyPolicySections(),
    getStructuredData('privacy-policy', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <PrivacyPolicyMain sections={sectionMap} />
    </>
  );
}
