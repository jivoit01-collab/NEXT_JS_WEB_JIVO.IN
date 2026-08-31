import type { ReactNode } from 'react';
import { OliveOilsHero } from './hero-section';
import { VariantSection } from './variant-section';
import { DifferenceSection } from './difference-section';
import { OLIVE_VIRGIN, OLIVE_LIGHT, OLIVE_POMACE } from '../constants';
import type {
  OliveOilsHeroContent,
  OliveOilsVariantContent,
  OliveOilsDifferenceContent,
} from '../types';

interface OliveOilsMainProps {
  /** ACTIVE sections in display order (already filtered + sorted by the query). */
  sections: { section: string; content: unknown }[];
}

/**
 * Renders only ACTIVE sections, in the admin-set DB order.
 *
 * The three variant sections (extraVirgin/extraLight/pomace) all use the SAME
 * `VariantSection` but with different background / image side / label colour, so
 * each section key maps to a RENDER FUNCTION (not just a component) that applies
 * its own styling. Deactivating or reordering any section is driven by the DB.
 */
const SECTION_RENDERERS: Record<string, (content: unknown) => ReactNode> = {
  hero: (content) => <OliveOilsHero data={content as OliveOilsHeroContent | undefined} />,
  extraVirgin: (content) => (
    <VariantSection
      id="olive-extra-virgin-heading"
      data={content as OliveOilsVariantContent}
      background={OLIVE_VIRGIN}
      imageSide="right"
    />
  ),
  extraLight: (content) => (
    <VariantSection
      id="olive-extra-light-heading"
      data={content as OliveOilsVariantContent}
      background={OLIVE_LIGHT}
      imageSide="left"
      labelColor="#FFFFFF"
    />
  ),
  pomace: (content) => (
    <VariantSection
      id="olive-pomace-heading"
      data={content as OliveOilsVariantContent}
      background={OLIVE_POMACE}
      imageSide="right"
      labelColor="#FFFFFF"
    />
  ),
  difference: (content) => (
    <DifferenceSection data={content as OliveOilsDifferenceContent | undefined} />
  ),
};

export function OliveOilsMain({ sections }: OliveOilsMainProps) {
  return (
    <main>
      {sections.map(({ section, content }) => {
        const render = SECTION_RENDERERS[section];
        if (!render) return null;
        return <div key={section}>{render(content)}</div>;
      })}
    </main>
  );
}
