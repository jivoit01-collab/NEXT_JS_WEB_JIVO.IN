import { JsonLd } from '@/components/shared/public';
import { CertificationsMain } from '@/modules/our-essence/certifications-quality-standards';
import { getCertificationsSections } from '@/modules/our-essence/certifications-quality-standards/data/queries';
import { defaultSeo } from '@/modules/our-essence/certifications-quality-standards/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-essence-certifications-quality-standards', defaultSeo);
}

export default async function CertificationsQualityStandardsPage() {
  const [sections, structuredData] = await Promise.all([
    getCertificationsSections(),
    getStructuredData('our-essence-certifications-quality-standards', defaultSeo),
  ]);

  const sectionMap = new Map<string, unknown>();
  for (const s of sections) {
    sectionMap.set(s.section, s.content);
  }

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <CertificationsMain sections={sectionMap} />
    </>
  );
}
