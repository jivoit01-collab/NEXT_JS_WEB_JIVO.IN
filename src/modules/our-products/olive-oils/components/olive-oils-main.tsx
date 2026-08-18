import { OliveOilsHero } from './hero-section';
import { VariantSection } from './variant-section';
import { DifferenceSection } from './difference-section';
import { OLIVE_VIRGIN, OLIVE_LIGHT, OLIVE_POMACE } from '../constants';
import {
  defaultExtraVirginContent,
  defaultExtraLightContent,
  defaultPomaceContent,
} from '../data/defaults';
import type {
  OliveOilsHeroContent,
  OliveOilsVariantContent,
  OliveOilsDifferenceContent,
} from '../types';

interface OliveOilsMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design screenshots:
 *   1. Hero  2. Extra Virgin  3. Extra Light  4. Pomace  5. The Jivo difference
 *
 * Sections 2-4 share one `VariantSection` component — they differ only in
 * background colour, which side the olive artwork sits on, and their content.
 *
 * All sections render eagerly so their SEO-relevant copy ships in the ISR HTML
 * (performance.md §9.2). The interactive sections are lightweight client
 * islands — no next/dynamic skeleton swap, which avoids the
 * skeleton-then-content flash flagged in the production audit.
 */
export function OliveOilsMain({ sections }: OliveOilsMainProps) {
  const extraVirgin =
    (sections.get('extraVirgin') as OliveOilsVariantContent | undefined) ??
    defaultExtraVirginContent;
  const extraLight =
    (sections.get('extraLight') as OliveOilsVariantContent | undefined) ?? defaultExtraLightContent;
  const pomace =
    (sections.get('pomace') as OliveOilsVariantContent | undefined) ?? defaultPomaceContent;

  return (
    <main>
      <OliveOilsHero data={sections.get('hero') as OliveOilsHeroContent | undefined} />

      <VariantSection
        id="olive-extra-virgin-heading"
        data={extraVirgin}
        background={OLIVE_VIRGIN}
        imageSide="right"
      />
      {/* Extra Light and Pomace sit on darker fields, so their pack labels are
          white for legibility — Extra Virgin keeps the pale sage default. */}
      <VariantSection
        id="olive-extra-light-heading"
        data={extraLight}
        background={OLIVE_LIGHT}
        imageSide="left"
        labelColor="#FFFFFF"
      />
      <VariantSection
        id="olive-pomace-heading"
        data={pomace}
        background={OLIVE_POMACE}
        imageSide="right"
        labelColor="#FFFFFF"
      />

      <DifferenceSection
        data={sections.get('difference') as OliveOilsDifferenceContent | undefined}
      />
    </main>
  );
}
