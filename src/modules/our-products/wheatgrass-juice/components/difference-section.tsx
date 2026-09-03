'use client';

import type { WheatgrassDifferenceContent } from '../types';
import { defaultDifferenceContent } from '../data/defaults';
import { WHEATGRASS_LEAF, WHEATGRASS_INK } from '../constants';
import { CopyWithArtSection, CopyWithArtSectionSkeleton } from './copy-with-art-section';

interface Props {
  data?: WheatgrassDifferenceContent;
}

/**
 * Section 4 — "A DIFFERENCE YOU CAN SEE AND TASTE".
 * Pale leaf field with deep-forest ink, tilted bottle bleeding off the
 * bottom-right. Same layout as section 3, inverted palette.
 */
export function DifferenceSection({ data }: Props) {
  const { heading, paragraph, image } = data ?? defaultDifferenceContent;

  return (
    <CopyWithArtSection
      headingId="wheatgrass-difference-heading"
      heading={heading}
      paragraph={paragraph}
      image={image}
      backgroundColor={WHEATGRASS_LEAF}
      headingColor={WHEATGRASS_INK}
      bodyColor={WHEATGRASS_INK}
      artPosition="bottom"
      // ── BOTTLE TUNING ──────────────────────────────────────────
      // tilt: -35deg lays the bottle on the diagonal (cap toward the upper
      // right), matching the reference. Pushed right/down so the base runs
      // off the corner rather than floating inside the section.
      artTuning={{
        // Source art is an UPRIGHT bottle (601x2000). -38deg lays it on the
        // diagonal with the cap toward the upper-left and the base running off
        // the bottom-right corner, as in the reference.
        tilt: -38,
        offsetX: '-8%',
        offsetY: '-16%',
        width: 'clamp(15rem, 40vw, 32rem)',
      }}
    />
  );
}

export function DifferenceSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_LEAF} />;
}
