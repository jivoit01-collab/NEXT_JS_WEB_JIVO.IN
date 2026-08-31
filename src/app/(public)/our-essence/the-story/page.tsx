import { JsonLd } from '@/components/shared/public';
import { TheStoryMain } from '@/modules/our-essence/the-story';
import { getTheStorySections } from '@/modules/our-essence/the-story/data/queries';
import { defaultSeo } from '@/modules/our-essence/the-story/data/defaults';
import { resolveSeo, getStructuredData } from '@/modules/seo/utils';

// ISR — refresh every 5 minutes; admin saves call revalidatePath() for instant invalidation.
// See docs/prompt1.md §38.
export const revalidate = 300;

export async function generateMetadata() {
  return resolveSeo('our-essence-the-story', defaultSeo);
}

export default async function TheStoryPage() {
  const [sections, structuredData] = await Promise.all([
    getTheStorySections(),
    getStructuredData('our-essence-the-story', defaultSeo),
  ]);

  const orderedSections = sections.map((s) => ({ section: s.section, content: s.content }));

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <TheStoryMain sections={orderedSections} />
    </>
  );
}
