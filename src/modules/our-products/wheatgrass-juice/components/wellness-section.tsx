'use client';

import type { WheatgrassWellnessContent } from '../types';
import { defaultWellnessContent } from '../data/defaults';
import { WHEATGRASS_FOREST, WHEATGRASS_CREAM } from '../constants';
import { CopyWithArtSection, CopyWithArtSectionSkeleton } from './copy-with-art-section';

interface Props {
  data?: WheatgrassWellnessContent;
}

/**
 * Section 3 — "MORE THAN A JUICE: A CARRIER OF WELLNESS".
 * Deep forest field, white copy, wheatgrass blades bleeding off the right.
 */
export function WellnessSection({ data }: Props) {
  const { heading, paragraph, image } = data ?? defaultWellnessContent;

  return (
    <CopyWithArtSection
      headingId="wheatgrass-wellness-heading"
      heading={heading}
      paragraph={paragraph}
      image={image}
      backgroundColor={WHEATGRASS_FOREST}
      headingColor={WHEATGRASS_CREAM}
      bodyColor={WHEATGRASS_CREAM}
      artPosition="bottom"
      // ── BLADES TUNING ──────────────────────────────────────────
      // tilt: 0 keeps the blades' own natural fan angle from the artwork.
      // Nudged right/down so the tips reach toward the copy, matching the
      // reference where the fan sits low on the right.
      artTuning={{
        // The source art is a single UPRIGHT bunch (407x1700). -58deg lays it
        // on the diagonal so the blades sweep up-left with the roots anchored
        // at the bottom-right corner, matching the reference.
        tilt: -58,
        offsetX: '-6%',
        offsetY: '-14%',
        width: 'clamp(16rem, 42vw, 34rem)',
      }}
    />
  );
}

export function WellnessSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_FOREST} />;
}
