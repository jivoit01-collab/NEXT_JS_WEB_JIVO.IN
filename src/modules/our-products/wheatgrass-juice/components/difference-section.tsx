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
      // ── BOTTLE TUNING ──────────────────────────────────────────
      // tilt: -35deg lays the bottle on the diagonal (cap toward the upper
      // right), matching the reference. Pushed right/down so the base runs
      // off the corner rather than floating inside the section.
      artTuning={{
        // Upright bottle laid on the diagonal, cap toward the upper left.
        tilt: 50,
        // POSITIVE = pull INWARD from the right/bottom edges. See the blades
        // above: rotation widens the visible shape well beyond its box.
        offsetX: '14%',
        // Scales WITH the art (same clamp curve as `width`) so the offset-to-
        // size ratio stays 0.45x at every width; peak is still 10rem, so the
        // desktop look is unchanged.
        offsetY: 'clamp(5.91rem, 13.64vw, 12rem)',
        width: 'clamp(13rem, 30vw, 22rem)',
      }}
    />
  );
}

export function DifferenceSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_LEAF} />;
}
