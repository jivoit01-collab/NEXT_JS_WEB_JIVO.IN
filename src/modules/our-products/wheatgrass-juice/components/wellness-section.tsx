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
      artPosition="center"
    />
  );
}

export function WellnessSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_FOREST} />;
}
